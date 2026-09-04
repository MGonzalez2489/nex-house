import { NxFile } from '@core/database';
import { buildPublicUrl } from '@core/utils';
import { FileModel } from '@nexhouse/shared-domain/models';

export const FileToModelMapper = (file: NxFile): FileModel => {
  return {
    originalName: file.originalName,
    fileName: file.fileName,
    mimeType: file.mimeType,
    size: file.size,
    // url: file.url,
    url: buildPublicUrl(file.url),
    extension: file.extension,
    publicId: file.publicId,
    createdAt: file.createdAt,
  };
};
