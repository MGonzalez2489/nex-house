export class ChargeSummaryModel {
  totalPendingAmount: number; // Suma de montos donde status = PENDING
  pendingCount: number;

  totalPaidAmount: number; // Suma de montos donde status = PAID
  paidCount: number;

  totalCancelledAmount: number; // Suma de montos donde status = CANCELLED
  cancelledCount: number;

  overdueCount: number; // Conteo de cargos cuya fecha venció y siguen PENDING

  collectionRate: number; // (Paid / (Paid + Pending)) * 100
}
