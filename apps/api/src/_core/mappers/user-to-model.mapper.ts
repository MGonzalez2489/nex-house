import { User } from '@core/database';
import { UserModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';

export const UserToModelMapper = (user: User): UserModel => {
  return {
    email: user.email,
    role: CatalogToModelMapper(user.role),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName ?? ''}`.trim(),
    phone: user.phone,
    status: CatalogToModelMapper(user.status),
    neighborhood: undefined,
  };
};
