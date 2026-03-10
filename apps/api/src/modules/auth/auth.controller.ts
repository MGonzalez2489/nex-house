import { CurrentUser, Public } from '@common/decorators';
import { User } from '@database/entities';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionModel, UserModel } from '@nex-house/models';
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

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User' })
  async me(@CurrentUser() user: User): Promise<UserModel> {
    return this.authService.me(user);
  }
}
