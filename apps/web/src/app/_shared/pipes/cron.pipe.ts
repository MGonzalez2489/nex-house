import { Pipe, PipeTransform } from '@angular/core';
import { CronInterpreter } from '@shared/utils';

@Pipe({
  name: 'cronToHuman',
  standalone: true,
})
export class CronToHumanPipe implements PipeTransform {
  /**
   * @param value El string cron (ej: '0 0 * * 5')
   * @param type 'frequency' | 'detail' | 'full'
   */
  transform(
    value: string | undefined | null,
    type: 'frequency' | 'detail' | 'full' = 'full',
  ): string {
    if (!value) return '';

    const result = CronInterpreter.parse(value);

    if (type === 'frequency') return result.frequency;
    if (type === 'detail') return result.detail;

    return `${result.frequency}: ${result.detail}`;
  }
}
