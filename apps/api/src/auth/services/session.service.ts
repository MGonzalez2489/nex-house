import { NxSession, User } from '@core/database';
import { UserToModelMapper } from '@core/mappers';
import { CryptoService } from '@core/services';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionModel } from '@nexhouse/shared-domain/models';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import UAParser from 'ua-parser-js';
import { TokenService } from './token.service';

@Injectable()
export class SessionService {
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
      expiresAt: refreshToken.expiresAtDate,
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
   * @returns A new session model with updated tokens.
   */
  async refreshSession(
    refreshToken: string,
    userAgent: string,
  ): Promise<SessionModel> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;

    try {
      // 1. Verify JWT
      payload = this.tokenService.verifyToken(refreshToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token' + e);
    }

    //find existing db session
    const session = await this.repository.findOne({
      where: { publicId: payload.session, revoked: false },
      relations: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // 3. Does it match?
    const isMatch = await this.cryptoService.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isMatch) {
      // Maybe we'll require revoque all existing sessions
      throw new UnauthorizedException('Token reuse detected');
    }
    // this.cancelActiveSessions(session.user.id, userAgent);

    return this.createSession(
      session.user,
      userAgent,
      session.ipAddress,
      true, // O basado en la expiración original
      session?.socketId || undefined,
    );
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
          socketId: undefined,
          lastActivity: new Date(),
        },
      );
    } catch (e) {
      console.log('expired token' + e);
      // Si el token ya expiró o es inválido, no hacemos nada,
      // pero igual limpiaremos la cookie en el controlador.
    }
  }
}
