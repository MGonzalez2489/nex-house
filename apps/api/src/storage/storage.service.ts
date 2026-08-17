import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}
  deleteUploadFile(fileName: string) {
    const url = this.configService.get('UPLOAD_DIR');
    // TODO: fix file path
    // const assetsConfig = this.configService.get<IAssetsConfiguration>(
    //   ConfigNameEnum.assets,
    // );
    //
    // //format file and clean possible double matches
    // fileName = fileName.replace(global.appUrl, '');
    // fileName = fileName.replace(assetsConfig!.assetsPath, '');
    // fileName = fileName.replace(assetsConfig!.uploadsPath, '');

    //detect original route
    // const destination = join(
    //   __dirname,
    //   '../',
    //   '../',
    //   assetsConfig!.rootPath,
    //   assetsConfig!.assetsPath,
    //   assetsConfig!.uploadsPath,
    //   fileName,
    // );

    const destination = join(__dirname, url);
    fs.unlink(destination, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }
}
