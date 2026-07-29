import { User } from '@core/database';
import { UserModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
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

    neighborhood: undefined,
    publicId: user.publicId,

    status: CatalogToModelMapper(user.status),
    role: CatalogToModelMapper(user.role),
    units: user.units ? user.units.map((f) => UserUnitToModel(f)) : user.units,
  };
};
