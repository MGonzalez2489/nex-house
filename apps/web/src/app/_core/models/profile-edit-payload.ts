import { UpdateUserProfile } from "@nexhouse/shared-domain/interfaces";

export interface ProfileEditPayload extends UpdateUserProfile {
  avatar?: File;
}

export function toProfileFormData(payload: ProfileEditPayload): FormData {
  const formData = new FormData();

  if (payload.firstName !== undefined) {
    formData.append("firstName", payload.firstName);
  }
  if (payload.lastName !== undefined) {
    formData.append("lastName", payload.lastName);
  }
  if (payload.phone !== undefined) {
    formData.append("phone", payload.phone);
  }
  if (payload.avatar) {
    formData.append("avatar", payload.avatar, payload.avatar.name);
  }

  return formData;
}