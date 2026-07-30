export interface UserStats {
  summary: {
    totalUsers: number;
  };
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
}
