export interface CreateNeighborhood {
  name: string;
  streets: CreateNeighStreet[];
  isActive: boolean;
  adminEmail: string;
}

export interface CreateNeighStreet {
  publicId?: string;
  name: string;
}
