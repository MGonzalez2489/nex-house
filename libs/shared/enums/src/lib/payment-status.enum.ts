export enum PaymentStatusEnum {
  PENDING = 'pending', // El residente subió el ticket pero el admin no lo ha visto
  APPROVED = 'approved', // El dinero ya está en la cuenta
  REJECTED = 'rejected', // El ticket era falso o el monto estaba mal
  CANCELED = 'canceled',
}
