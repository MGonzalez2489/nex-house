/**
 * Traduce expresiones cron simples a lenguaje humano para el UI de NexHouse.
 * Soporta formatos básicos: "0 0 * * [0-6]" o "0 0 [1-31] * *"
 */
export class CronInterpreter {
  private static readonly DAYS = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  static parse(cron: string): { frequency: string; detail: string } {
    const parts = cron.split(' ');
    if (parts.length < 5) return { frequency: 'Manual', detail: 'N/A' };

    const [, , dom, month, dow] = parts;

    // Semanal: 0 0 * * 5
    if (dow !== '*' && dom === '*') {
      return {
        frequency: 'Semanal',
        detail: `Cada ${this.DAYS[Number(dow)]}`,
      };
    }

    // Mensual: 0 0 1 * *
    if (dom !== '*' && dow === '*') {
      return {
        frequency: 'Mensual',
        detail: `El día ${dom} de cada mes`,
      };
    }

    // Anual: 0 0 1 1 *
    if (dom !== '*' && month !== '*') {
      return {
        frequency: 'Anual',
        detail: `Cada ${dom} de ${month}`,
      };
    }

    return { frequency: 'Personalizado', detail: cron };
  }

  /**
   * Calcula las siguientes fechas de ejecución basadas en un cron simplificado.
   * Útil para mostrar en el Side Drawer sin saturar el Backend.
   */
  static getNextOccurrences(cron: string, count = 2): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    const parts = cron.trim().split(' ');
    if (parts.length < 5) return dates;

    const [, , dom, , dow] = parts;

    for (let i = 1; i <= 30 && dates.length < count; i++) {
      const future = new Date();
      future.setDate(now.getDate() + i);

      if (dow !== '*' && future.getDay() === Number(dow)) {
        dates.push(new Date(future));
      } else if (dom !== '*' && future.getDate() === Number(dom)) {
        dates.push(new Date(future));
      }
    }
    return dates;
  }
}
