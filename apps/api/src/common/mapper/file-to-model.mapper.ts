import { NxFile } from '@database/entities';
import { FileModel } from '@nex-house/models';

export function FileToModel(file: NxFile): FileModel {
  return {
    publicId: file.publicId,
    originalName: file.originalName,
    fileName: file.fileName,
    mimeType: file.mimeType,
    size: file.size,
    url: file.url,
    extension: file.extension,
  };
}
