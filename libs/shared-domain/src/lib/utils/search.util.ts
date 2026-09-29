import { Search } from '../interfaces/search/search.interface';

/**
 * Keys of `Search` that describe the query itself (paging, sorting, "show all")
 * rather than a filter the user actually chose.
 */
const QUERY_KEYS = new Set([
  'first',
  'rows',
  'sortField',
  'sortOrder',
  'showAll',
]);

/**
 * Counts how many filters are actually applied, so the UI can badge the control
 * that opens the filter surface. Paging and sorting are ignored: they change the
 * query, not the result set, and reporting them would make the badge lie.
 *
 * `false` is counted as an applied filter (choosing "inactive" is a real
 * choice), while `undefined`, `null` and `''` count as nothing.
 *
 * @example
 * countActiveFilters({ globalFilter: 'centro' });            // 1
 * countActiveFilters({ globalFilter: '', isActive: false }); // 1
 * countActiveFilters({ first: 0, rows: 10, showAll: true }); // 0
 * countActiveFilters({});                                    // 0
 */
export function countActiveFilters(
  filters: Partial<Search> | null | undefined,
): number {
  if (!filters) {
    return 0;
  }

  return Object.entries(filters).filter(
    ([key, value]) =>
      !QUERY_KEYS.has(key) &&
      value !== undefined &&
      value !== null &&
      value !== '',
  ).length;
}
