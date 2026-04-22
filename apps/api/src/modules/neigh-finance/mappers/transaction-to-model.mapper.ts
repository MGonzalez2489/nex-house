import { Transaction } from '@database/entities';
import { TransactionModel } from '@nex-house/models';

export function TransactionToModel(transaction: Transaction): TransactionModel {
  return {
    publicId: transaction.publicId,
    type: transaction.type,
    amount: transaction.amount / 1000,
    sourceType: transaction.sourceType,
    title: transaction.description,
    description: transaction.description,
    transactionDate: transaction.transactionDate.toString(),
    evidenceUrl: transaction.evidenceUrl,
    // transactionDate: transaction.transactionDate.toDateString(),
  };
}
