import { Module } from '@nestjs/common';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { UserModule } from '@administration/user/user.module';
import { UserSearchService } from '@administration/user/services';
import { SessionService } from './services/session.service';

@Module({
  imports: [UserModule],
  providers: [AuthService, UserSearchService, SessionService],
  controllers: [AuthController],
})
export class AuthModule {}
