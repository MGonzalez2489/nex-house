import { BaseModel } from './_base.model';

export class FileModel extends BaseModel {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  extension: string;
}
