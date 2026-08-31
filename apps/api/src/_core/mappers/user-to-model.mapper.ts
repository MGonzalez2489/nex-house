import { User } from '@core/database';
import { UserModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
import { NeighborhoodToModelMapper } from './neighborhood-to-model.mapper';
import { UserUnitToModel } from './user-unit.mapper';
import { UserProfileToModelMapper } from './uprofile-to-model.mapper';

export const UserToModelMapper = (user: User): UserModel => {
  return {
    publicId: user.publicId,
    email: user.email,
    isFirstAdmin: user.isFirstAdmin,
    requirePwdChange: user.requirePwdChange,
    neighborhood: user.neighborhood
      ? NeighborhoodToModelMapper(user.neighborhood)
      : undefined,
    profile: user.profile ? UserProfileToModelMapper(user.profile) : undefined,
    status: user.status ? CatalogToModelMapper(user.status) : user.status,
    role: user.role ? CatalogToModelMapper(user.role) : user.role,
    userUnits: user.userUnits
      ? user.userUnits.map((f) => UserUnitToModel(f))
      : [],
  };
};
