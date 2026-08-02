export interface UnitStats {
  summary: {
    totalUnits: number;
  };
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byStreet: Record<string, number>;
}
