import { FeeScheduleTypeEnum, FeeScheduleStatusEnum } from '@nex-house/enums';
import { ICreateFeeSchedule } from '@nex-house/interfaces';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

export class CreateFeeScheduleDto implements ICreateFeeSchedule {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => value * 100)
  amount: number;

  @IsEnum(FeeScheduleTypeEnum)
  type: FeeScheduleTypeEnum;

  @IsEnum(FeeScheduleStatusEnum)
  @IsOptional()
  status?: FeeScheduleStatusEnum;

  @IsString()
  @IsOptional()
  cronSchedule?: string; // Obligatorio si es RECURRENT

  @IsString()
  startDate: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}
