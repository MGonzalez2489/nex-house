import { UserProfile } from '@core/database';
import { UserProfileModel } from '@nexhouse/shared-domain/models';
import { FileToModelMapper } from './file-to-model.mapper';

export const UserProfileToModelMapper = (
  profile: UserProfile,
): UserProfileModel => {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    phone: profile.phone,
    // avatar: buildPublicUrl(profile.avatar),
    avatar: profile.avatar ? FileToModelMapper(profile.avatar) : undefined,
    publicId: profile.publicId,
  };
};
