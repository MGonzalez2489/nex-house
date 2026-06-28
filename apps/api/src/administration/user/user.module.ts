import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserSearchService, UserService } from './services';
import { User } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],

  controllers: [UserController],
  providers: [UserService, UserSearchService],
  exports: [UserService, UserSearchService],
})
export class UserModule {}
