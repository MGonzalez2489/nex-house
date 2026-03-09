export enum DebtStatusEnum {
  NEW = 'new', // Generada por el sistema, el residente aún no la "ve" o no actúa.
  PARTIAL = 'partial', // Ha abonado un poco pero sigue debiendo.
  PAID = 'paid', // Totalmente liquidada.
  CANCELED = 'canceled', // Error administrativo o condonación.
}
