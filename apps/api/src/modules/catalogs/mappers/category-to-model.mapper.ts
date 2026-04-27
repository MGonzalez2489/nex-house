import { TransactionCategory } from '@database/entities';
import { TransactionCategoryModel } from '@nex-house/models';

export function TransactionCategoryToModel(
  cat: TransactionCategory,
): TransactionCategoryModel {
  return {
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    allowedType: cat.allowedType,
    publicId: cat.publicId,
  };
}
