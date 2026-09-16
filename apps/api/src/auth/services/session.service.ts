import { REFRESH_TOKEN_DURATION } from '@auth/constants';
import { NxSession, User } from '@core/database';
import { UserToModelMapper } from '@core/mappers';
import { CryptoService } from '@core/services';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionModel } from '@nexhouse/shared-domain/models';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import UAParser from 'ua-parser-js';
import { TokenService } from './token.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(NxSession)
    private readonly repository: Repository<NxSession>,
    private cryptoService: CryptoService,
    private tokenService: TokenService,
  ) {}

  /**
   * Creates a secure user session, handles device parsing, and issues JWT infrastructure tokens.
   * Optimizes database overhead by centralizing writes and avoiding payload decodes.
   *
   * @param user The target User entity requesting authentication.
   * @param userAgent The raw User-Agent header string from the client request.
   * @param ip The origin IP address of the request.
   * @param rememberMe Boundary flag extending session lifecycles from 7 to 30 days.
   * @param existingSocket Optional active WebSocket registration identifier.
   * @returns A promise resolving to the structured access metadata tokens.
   */
  async createSession(
    user: User,
    userAgent: string,
    ip: string,
    rememberMe = false,
    existingSocket?: string,
  ): Promise<SessionModel> {
    const parser = new UAParser.UAParser(userAgent);
    const agentData = parser.getResult();

    // 1. Pre-generate session public ID to perform a single database write execution
    const sessionPublicId = randomUUID();

    const refreshToken = this.tokenService.createRefreshAccessToken(
      user.publicId,
      sessionPublicId,
      rememberMe,
    );

    const refreshTokenHash = await this.cryptoService.hash(refreshToken.token);

    // 2. Build the completed entity state maps
    const session = this.repository.create({
      publicId: sessionPublicId,
      userId: user.id,
      refreshTokenHash,
      browser: agentData.browser.name,
      browserVersion: agentData.browser.version,
      os: agentData.os.name,
      device: agentData.device.model || 'Desktop',
      ipAddress: ip,
      expiresAt: new Date(refreshToken.expiresInMs),
      socketId: existingSocket,
    });

    await this.repository.save(session);
    const accessToken = this.tokenService.createAccessToken(
      user.email,
      user.publicId,
      sessionPublicId,
    );
    // 3. Performance Optimization: Compute expiration timestamp mathematically instead
    // of executing decoding overhead

    return {
      user: UserToModelMapper(user),
      token: accessToken.token,
      refreshToken: refreshToken.token,
      exp: accessToken.expiresInMs,
    };
  }

  /**
   * Refreshes an existing session by validating the refresh token.
   * @param refreshToken The raw token from the cookie.
   * @param userAgent The raw User-Agent header string of the refresh request.
   * @param ip The current origin IP of the refresh request; falls back to the
   *   stored session IP when not provided.
   * @returns A new session model with updated tokens.
   */
  async refreshSession(
    refreshToken: string,
    userAgent: string,
    ip?: string,
  ): Promise<SessionModel> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;

    try {
      // 1. Verify JWT
      payload = this.tokenService.verifyToken(refreshToken);
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Refresh rejected: invalid or expired token (${reason})`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. Find the active DB session tied to the token
    const session = await this.repository.findOne({
      where: { publicId: payload.session, revoked: false },
      relations: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // 3. The token must belong to the user the session row points to
    if (!session.user || session.user.publicId !== payload.sub) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // 4. Does it match?
    const isMatch = await this.cryptoService.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Token reuse detected');
    }

    // 5. Preserve the original lifecycle: 7-day sessions stay 7-day, 30-day stay 30-day
    const rememberMe =
      Number.isFinite(payload.exp) && Number.isFinite(payload.iat)
        ? payload.exp - payload.iat > REFRESH_TOKEN_DURATION / 1000
        : false;

    const sessionModel = await this.createSession(
      session.user,
      userAgent,
      ip || session.ipAddress,
      rememberMe,
      session.socketId ?? undefined,
    );

    // 6. Rotate the session: the presented refresh token becomes single-use
    await this.repository.update(
      { publicId: session.publicId },
      { revoked: true, lastActivity: new Date() },
    );

    return sessionModel;
  }

  /**
   * Revokes a session and invalidates the refresh token.
   * @param refreshToken The token from the cookie.
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // 1.Verify token to get session ID
      const payload = this.tokenService.verifyToken(refreshToken);

      // 2. Revoke session
      await this.repository.update(
        { publicId: payload.session },
        {
          revoked: true,
          socketId: null,
          lastActivity: new Date(),
        },
      );
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      this.logger.log(
        `Logout skipped: invalid or expired refresh token (${reason})`,
      );
    }
  }
}
