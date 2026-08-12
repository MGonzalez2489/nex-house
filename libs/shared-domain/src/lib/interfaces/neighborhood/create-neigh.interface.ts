export interface CreateNeighborhood {
  name: string;
  streets: CreateNeighStreet[];
  isActive: boolean;
  adminEmail: string;

  zipCode: string;
  cityId: string;
}

export interface CreateNeighStreet {
  publicId?: string;
  name: string;
}
