import { UnitsModule } from '@administration/units';
import { CatalogsModule } from '@catalogs/catalogs.module';
import { CoreModule } from '@core/core.module';
import { User, UserProfile } from '@core/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from 'src/storage/storage.module';
import {
  OnboardingController,
  ProfileController,
  UserController,
} from './controllers';
import {
  OnboardingService,
  ProfileService,
  UserSearchService,
  UserService,
  UserStatsService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    CatalogsModule,
    CoreModule,
    StorageModule,
    UnitsModule,
  ],
  controllers: [UserController, ProfileController, OnboardingController],
  providers: [
    UserService,
    UserSearchService,
    UserStatsService,
    OnboardingService,
    ProfileService,
  ],
  exports: [UserService, UserSearchService, OnboardingService],
})
export class UserModule {}
