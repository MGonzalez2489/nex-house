import { User } from '@core/database';
import { buildPublicUrl } from '@core/utils';
import { UserModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
import { NeighborhoodToModelMapper } from './neighborhood-to-model.mapper';
import { UserUnitToModel } from './user-unit.mapper';

export const UserToModelMapper = (user: User): UserModel => {
  return {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName:
      user.firstName || user.lastName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : undefined,
    phone: user.phone,

    requirePwdChange: user.requirePwdChange,

    neighborhood: user.neighborhood
      ? NeighborhoodToModelMapper(user.neighborhood)
      : null,
    publicId: user.publicId,
    avatar: buildPublicUrl(user.avatar),

    status: user.status ? CatalogToModelMapper(user.status) : user.status,
    role: user.role ? CatalogToModelMapper(user.role) : user.role,
    userUnits: user.userUnits
      ? user.userUnits.map((f) => UserUnitToModel(f))
      : [],
  };
};
