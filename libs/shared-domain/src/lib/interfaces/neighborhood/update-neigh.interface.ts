export interface UpdateNeighborhood {
  name?: string;
  streets?: UpdateNeighStreet[];
  isActive?: boolean;
}

export interface UpdateNeighStreet {
  publicId?: string;
  name: string;
}
