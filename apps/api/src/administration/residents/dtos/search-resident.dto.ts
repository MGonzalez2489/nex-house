import { SearchDto } from '@core/dtos';
import { SearchUser } from '@nexhouse/shared-domain/interfaces';
import { IsString, IsOptional } from 'class-validator';

export class SearchUserDto extends SearchDto implements SearchUser {
  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
