import { ApiProperty } from '@nestjs/swagger';
import { IBulkCreateHousingUnit } from '@nex-house/interfaces';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class BulkCreateHousingUnitDto implements IBulkCreateHousingUnit {
  @ApiProperty({
    example: 'Privada Maple',
    description: 'The name of the street or section',
  })
  @IsString()
  @IsNotEmpty()
  streetName: string;

  @ApiProperty({ example: 1, description: 'The starting house number' })
  @IsInt()
  @Min(1)
  startNumber: number;

  @ApiProperty({ example: 60, description: 'The ending house number' })
  @IsInt()
  @Min(1)
  @Max(500)
  endNumber: number;
}
