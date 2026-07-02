import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserSearchService, UserService } from './services';
import { User } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/catalogs';
import { CoreModule } from '@core/core.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CatalogsModule, CoreModule],
  controllers: [UserController],
  providers: [UserService, UserSearchService],
  exports: [UserService, UserSearchService],
})
export class UserModule {}
