import { FeeScheduleTypeEnum } from '@nex-house/enums';
import { ICreateFeeSchedule } from '@nex-house/interfaces';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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
  @Transform(({ value }) => value * 1000)
  amount: number;

  @IsEnum(FeeScheduleTypeEnum)
  type: FeeScheduleTypeEnum;

  @IsDateString()
  startDate: string;

  //recurrent

  @IsString()
  @IsOptional()
  frecuency?: string;

  @IsNumber()
  @IsOptional()
  dayOfMonth?: number;

  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
