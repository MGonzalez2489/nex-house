import { Search } from './search.interface';

export interface SearchTransaction extends Search {
  category?: string;
  month: number;
  year: number;
}
