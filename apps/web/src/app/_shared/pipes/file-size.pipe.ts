import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
  private readonly units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  transform(bytes?: number, precision = 2): string {
    if (!bytes) return '0 Bytes';

    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes) || bytes <= 0) {
      return '0 Bytes';
    }

    let unitIndex = 0;
    while (bytes >= 1024 && unitIndex < this.units.length - 1) {
      bytes /= 1024;
      unitIndex++;
    }

    return `${bytes.toFixed(precision)} ${this.units[unitIndex]}`;
  }
}
