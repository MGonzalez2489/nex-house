import { UserProfile } from '@core/database';
import { buildPublicUrl } from '@core/utils';
import { UserProfileModel } from '@nexhouse/shared-domain/models';

export const UserProfileToModelMapper = (
  profile: UserProfile,
): UserProfileModel => {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    phone: profile.phone,
    avatar: buildPublicUrl(profile.avatar),
    publicId: profile.publicId,
  };
};
