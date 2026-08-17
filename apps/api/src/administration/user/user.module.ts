import { Module } from '@nestjs/common';
import { UserController } from './controllers';
import { UserSearchService, UserService } from './services';
import { User } from '@core/database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/catalogs';
import { CoreModule } from '@core/core.module';
import { UserStatsService } from './services/user-stats.service';
import { ProfileController } from './controllers/profile.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CatalogsModule,
    CoreModule,
    StorageModule,
  ],
  controllers: [UserController, ProfileController],
  providers: [UserService, UserSearchService, UserStatsService],
  exports: [UserService, UserSearchService],
})
export class UserModule {}
