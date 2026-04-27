import { FileToModel } from '@common/mapper';
import { Transaction } from '@database/entities';
import { TransactionCategoryToModel } from '@modules/catalogs/mappers';
import { UserEntityToModel } from '@modules/users/mappers';
import { TransactionModel } from '@nex-house/models';

export function TransactionToModel(transaction: Transaction): TransactionModel {
  return {
    publicId: transaction.publicId,
    createdAt: transaction.createdAt,
    type: transaction.type,
    amount: transaction.amount / 1000,
    sourceType: transaction.sourceType,
    title: transaction.title,
    description: transaction.description,
    transactionDate: transaction.transactionDate.toString(),
    category: TransactionCategoryToModel(transaction.category),
    evidence: transaction.evidence
      ? FileToModel(transaction.evidence)
      : undefined,
    // evidenceUrl: transaction.evidenceUrl ? transaction.evidenceUrl : undefined,
    createdBy: transaction.createdByUser
      ? UserEntityToModel(transaction.createdByUser)
      : undefined,

    isActive: transaction.isActive,
    isReversal: transaction.isReversal,
    reversedBy: transaction.reversedBy
      ? TransactionToModel(transaction.reversedBy)
      : undefined,
  };
}
