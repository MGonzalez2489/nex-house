import { NxFile } from '@core/database';
import { getUploadsFolderPath } from '@core/utils';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { join, normalize, basename, dirname, extname } from 'path';
import { Repository } from 'typeorm';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(NxFile)
    private readonly repository: Repository<NxFile>,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(
    url: string,
    file: Express.Multer.File,
    prevFileId?: number,
  ) {
    const storageInfo = this.parseStoragePath(url);

    if (!prevFileId) {
      const newFile = this.repository.create({
        originalName: file.originalname,
        fileName: storageInfo.fileName,
        mimeType: file.mimetype,
        size: file.size,
        url: url,
        extension: storageInfo.extension,
      });
      return await this.repository.save(newFile);
    }

    const existing = await this.repository.findOne({
      where: { id: prevFileId },
    });
    if (!existing) throw new InternalServerErrorException('File not found');

    if (existing.originalName === file.originalname) return existing;

    existing.originalName = file.originalname;
    existing.fileName = storageInfo.fileName;
    existing.mimeType = file.mimetype;
    existing.size = file.size;
    existing.url = url;
    existing.extension = storageInfo.extension;

    await this.repository.update({ id: prevFileId }, existing);
    return existing;

    //verify if is the same to skip or update
  }

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

  private parseStoragePath(storageUrl: string) {
    // Normaliza separadores según el OS (evita errores entre / y \)
    const normalizedPath = normalize(storageUrl);

    // Extrae el nombre base (archivo + extensión)
    const fileName = basename(normalizedPath);

    // Extrae el directorio. Si no hay, retorna "."
    const dirName = dirname(normalizedPath);

    return {
      folder: dirName === '.' ? null : dirName,
      fileName: fileName,
      extension: extname(fileName).replace('.', ''),
    };
  }
}
