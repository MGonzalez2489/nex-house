export enum ChargeStatusEnum {
  PENDING = 'pending', //cargo generado, nadie ha hecho nada
  IN_REVIEW = 'in_review', //el residente subio algo
  PARTIAL = 'partial',
  PAID = 'paid', //el dinero ya esta en la cuenta
  CANCELLED = 'cancelled',
}
