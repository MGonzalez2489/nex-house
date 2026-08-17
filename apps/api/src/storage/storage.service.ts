import { getUploadsFolderPath } from '@core/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}
  deleteUploadFile(fileName: string) {
    const url = this.configService.get('UPLOAD_DIR');
    const destination = getUploadsFolderPath(url);

    const destionation = join(destination, fileName);

    fs.unlink(destionation, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }
}
