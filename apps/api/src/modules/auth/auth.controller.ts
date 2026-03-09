import { Public } from '@common/decorators';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SessionModel } from '@nex-house/models';
import { LoginDto } from './dtos';
import { AuthService } from './services';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto): Promise<SessionModel> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Public()
  async register(@Body() dto: LoginDto): Promise<SessionModel | undefined> {
    //TODO: add cookies handler
    // if (dto.rememberMe) {
    //   const newCookie = this.cookieService.create(newSession.access_token!);
    //   res.cookie(newCookie.name, newCookie.val, newCookie.options);
    //   delete newSession.access_token;
    // }
    return this.authService.register(dto);
  }
}
