import { parseStoragePath } from '@common/utils/path-parser.util';
import { NxFile, User } from '@database/entities';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UploadedFile as IUploadedFile,
  StorageProvider,
} from '@storage/providers';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(NxFile)
    private readonly fileRepository: Repository<NxFile>,
    @Inject('STORAGE_PROVIDER')
    private readonly storage: StorageProvider,
  ) {}

  /**
   * Sube un archivo al storage y crea el registro en la base de datos.
   */
  async uploadAndRegister(
    file: IUploadedFile,
    folder: string,
    user: User,
  ): Promise<NxFile> {
    // 1. Subida física al bucket/disk
    const url = await this.storage.upload(file, folder);

    const info = parseStoragePath(url);
    // const fStructureName = url.split('/');
    //
    // const fFolder = fStructureName[0];
    // const fName = fStructureName[1];

    // 2. Persistencia de metadata en DB
    const newFile = this.fileRepository.create({
      url,
      originalName: file.originalname,
      fileName: info.fileName,
      mimeType: file.mimetype,
      size: file.size,
      createdBy: user.id,
      extension: info.extension,
    });

    return await this.fileRepository.save(newFile);
  }

  /**
   * Elimina el archivo del storage y el registro de la DB.
   */
  async delete(publicId: string): Promise<void> {
    const file = await this.fileRepository.findOneBy({ publicId });
    if (file) {
      await this.storage.delete(file.url);
      await this.fileRepository.remove(file);
    }
  }
}
