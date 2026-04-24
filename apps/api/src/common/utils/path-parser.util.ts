import * as path from 'path';

/**
 * Procesa la ruta retornada por el StorageProvider de forma segura.
 * Maneja casos con carpeta "folder/file.ext" y sin ella "file.ext".
 */
export function parseStoragePath(storageUrl: string) {
  // Normaliza separadores según el OS (evita errores entre / y \)
  const normalizedPath = path.normalize(storageUrl);

  // Extrae el nombre base (archivo + extensión)
  const fileName = path.basename(normalizedPath);

  // Extrae el directorio. Si no hay, retorna "."
  const dirName = path.dirname(normalizedPath);

  return {
    folder: dirName === '.' ? null : dirName,
    fileName: fileName,
    extension: path.extname(fileName).replace('.', ''),
  };
}
