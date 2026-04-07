import { Search } from './search.interface';

export interface SearchCharges extends Search {
  status?: string;
  from?: string;
  to?: string;

  filterDate: string;
}
