import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '@database/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService } from '@common/services';
import { NeighborhoodsModule } from '@modules/neighborhoods';

@Module({
  imports: [TypeOrmModule.forFeature([User]), NeighborhoodsModule],
  controllers: [UsersController],
  providers: [UsersService, CryptoService],
  exports: [UsersService],
})
export class UsersModule {}
