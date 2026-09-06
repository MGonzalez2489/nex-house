import { isAbsolute, join } from 'path';

export function getUploadsFolderPath(configValue: string) {
  return isAbsolute(configValue)
    ? configValue
    : join(process.cwd(), configValue);
}

export function getAvatarFolderRelativePath(
  configValue: string,
  fileName: string,
) {
  return join(configValue, 'avatars', fileName);
}

export function getAvatarFolderFullPath(configValue: string, fileName: string) {
  const uploads = getUploadsFolderPath(configValue);
  return join(uploads, 'avatars', fileName);
}
