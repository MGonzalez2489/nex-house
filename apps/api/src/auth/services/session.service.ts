import { NxSession, User } from '@core/database';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionModel } from '@nexhouse/shared-domain/models';
import UAParser from 'ua-parser-js';
import { CryptoService } from '@core/services';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(NxSession)
    private readonly repository: Repository<NxSession>,
    private readonly jwtService: JwtService,
    private cryptoService: CryptoService,
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

    const daysValid = rememberMe ? 30 : 7;
    const nowInMs = Date.now();
    const expiresAt = new Date(nowInMs + daysValid * 24 * 60 * 60 * 1000);

    // 1. Pre-generate session public ID to perform a single database write execution
    const sessionPublicId = randomUUID();

    const refreshPayload = {
      sub: user.publicId,
      session: sessionPublicId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: `${daysValid}d`,
    });

    const refreshTokenHash = await this.cryptoService.hash(refreshToken);

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
      expiresAt,
      socketId: existingSocket,
    });

    await this.repository.save(session);

    const accessToken = this.jwtService.sign(
      {
        email: user.email,
        sub: user.publicId,
        session: sessionPublicId,
      },
      {
        expiresIn: '15m',
      },
    );

    // 3. Performance Optimization: Compute expiration timestamp mathematically instead of executing decoding overhead
    const accessTokenExpInSeconds = Math.floor(
      (nowInMs + 15 * 60 * 1000) / 1000,
    );

    return {
      token: accessToken,
      refreshToken,
      exp: accessTokenExpInSeconds,
    };
  }

  // async createSession(
  //   user: User,
  //   userAgent: string,
  //   ip: string,
  //   rememberMe = false,
  //   existingSocket?: string,
  // ): Promise<SessionModel> {
  //   const agentData = UAParser.UAParser(userAgent);
  //
  //   const expiresAt = new Date(
  //     Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
  //   );
  //
  //   const session = this.repository.create({
  //     userId: user.id,
  //     refreshTokenHash: '',
  //     browser: agentData.browser.name,
  //     browserVersion: agentData.browser.version,
  //     os: agentData.os.name,
  //     device: agentData.device.model || 'Desktop',
  //     ipAddress: ip,
  //     expiresAt,
  //     socketId: existingSocket,
  //   });
  //
  //   const savedSession = await this.repository.save(session);
  //
  //   const refreshPayload = {
  //     sub: user.publicId,
  //     session: savedSession.publicId,
  //   };
  //   const refreshToken = this.jwtService.sign(refreshPayload, {
  //     expiresIn: rememberMe ? '30d' : '7d',
  //   });
  //
  //   savedSession.refreshTokenHash = await this.cryptoService.hash(refreshToken);
  //   await this.repository.save(savedSession);
  //
  //   const accessToken = this.jwtService.sign(
  //     {
  //       email: user.email,
  //       sub: user.publicId,
  //       session: savedSession.publicId,
  //     },
  //     {
  //       expiresIn: '15m',
  //     },
  //   );
  //
  //   return {
  //     token: accessToken,
  //     refreshToken,
  //     exp: this.jwtService.decode(accessToken).exp,
  //   };
  // }
}
