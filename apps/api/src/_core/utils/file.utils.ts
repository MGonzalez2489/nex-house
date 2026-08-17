import { join } from 'path';

//
export function getUploadsFolderPath(configValue: string) {
  const destionation = join(
    __dirname,
    '../',
    '../',
    '../',
    'apps/api',
    configValue, //uploads
  );

  return destionation;
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
