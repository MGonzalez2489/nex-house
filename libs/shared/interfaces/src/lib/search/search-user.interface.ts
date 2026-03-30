import { Search } from './search.interface';

export interface SearchUser extends Search {
  role?: string;
  status?: string;
}
