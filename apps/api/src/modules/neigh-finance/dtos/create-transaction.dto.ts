import { ICreateTransaction } from '@nex-house/interfaces';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto implements ICreateTransaction {
  @IsString()
  type: 'income' | 'expense';
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => value * 1000)
  amount: number;
  @IsString()
  sourceType: string;
  @IsDateString()
  transactionDate: string;
  @IsString()
  title: string;
  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  evidence: string;
}
