export interface CreateNeighborhood {
  name: string;
  streets: CreateNeighStreet[];
  isActive: boolean;
}

export interface CreateNeighStreet {
  publicId?: string;
  name: string;
}
