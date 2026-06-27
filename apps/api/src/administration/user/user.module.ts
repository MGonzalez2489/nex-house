import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserSearchService, UserService } from './services';

@Module({
  controllers: [UserController],
  providers: [UserService, UserSearchService],
  exports: [UserService, UserSearchService],
})
export class UserModule {}
