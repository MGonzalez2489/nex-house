import { SearchUser } from '@nex-house/interfaces';
import { SearchDto } from './search.dto';
import { IsOptional, IsString } from 'class-validator';

export class SearchUserDto extends SearchDto implements SearchUser {
  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  status: string;
}
