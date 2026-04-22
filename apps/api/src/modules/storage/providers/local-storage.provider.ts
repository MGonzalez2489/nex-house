import { Injectable, Inject } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface para estandarizar el objeto de archivo sin depender
 * de los tipos globales de Express.Multer.
 */
export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface StorageProvider {
  /**
   * @param file Archivo a subir
   * @param folder Subcarpeta opcional (ej: 'evidences', 'avatars')
   */
  upload(file: UploadedFile, folder?: string): Promise<string>;
  delete(fileName: string, folder?: string): Promise<void>;
}

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  constructor(
    @Inject('STORAGE_CONFIG') private readonly config: { uploadDir: string },
  ) {
    // Asegura que el directorio raíz exista al iniciar
    if (!fs.existsSync(this.config.uploadDir)) {
      fs.mkdirSync(this.config.uploadDir, { recursive: true });
    }
  }

  /**
   * Guarda el archivo físicamente organizándolo por carpetas si se solicita.
   * @returns Ruta relativa final (ej: 'evidences/123.jpg')
   */
  async upload(file: UploadedFile, folder = ''): Promise<string> {
    const targetDir = path.join(this.config.uploadDir, folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const fileName = folder ? path.join(folder, uniqueName) : uniqueName;
    const fullPath = path.join(this.config.uploadDir, fileName);

    await fs.promises.writeFile(fullPath, file.buffer);
    return fileName;
  }

  async delete(fileName: string, folder = ''): Promise<void> {
    const fullPath = path.join(this.config.uploadDir, folder, fileName);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}
