export enum TransactionSourceTypeEnum {
  PAYMENT = 'payment', //entrada de dinero (ej. un inquilino paga la renta), afecta el flujo positivamente
  EXPENSE = 'expense', //salida de dinero (ej. se pago una reparacion)
}
