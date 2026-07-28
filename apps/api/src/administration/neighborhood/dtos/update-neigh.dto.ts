import {
  UpdateNeighborhood,
  UpdateNeighStreet,
} from '@nexhouse/shared-domain/interfaces';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
  ArrayMinSize,
  IsArray,
} from 'class-validator';

export class UpdateNeighStreetDto implements UpdateNeighStreet {
  @IsOptional()
  @IsString()
  publicId?: string;

  @IsString()
  name: string;
}

export class UpdateNeighborhoodDto implements UpdateNeighborhood {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateNeighStreetDto)
  streets?: UpdateNeighStreetDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
