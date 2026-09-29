import { countActiveFilters } from './search.util';

describe('countActiveFilters', () => {
  it('should return 0 for an empty filter object', () => {
    expect(countActiveFilters({})).toBe(0);
  });

  it('should return 0 for null and undefined', () => {
    expect(countActiveFilters(null)).toBe(0);
    expect(countActiveFilters(undefined)).toBe(0);
  });

  it('should count a global filter', () => {
    expect(countActiveFilters({ globalFilter: 'centro' })).toBe(1);
  });

  it('should not count an empty global filter', () => {
    expect(countActiveFilters({ globalFilter: '' })).toBe(0);
  });

  it('should not count an undefined filter', () => {
    expect(countActiveFilters({ globalFilter: undefined })).toBe(0);
  });

  it('should count a false boolean as an applied choice', () => {
    expect(countActiveFilters({ isActive: false })).toBe(1);
  });

  it('should count every applied filter', () => {
    expect(countActiveFilters({ globalFilter: 'centro', isActive: true })).toBe(2);
  });

  it('should ignore paging and sorting keys', () => {
    expect(
      countActiveFilters({ first: 0, rows: 10, showAll: true }),
    ).toBe(0);
  });

  it('should ignore sort metadata', () => {
    expect(
      countActiveFilters({ sortField: 'name', sortOrder: 1 }),
    ).toBe(0);
  });

  it('should combine real filters with paging keys', () => {
    expect(
      countActiveFilters({ globalFilter: 'centro', first: 0, rows: 10 }),
    ).toBe(1);
  });
});
