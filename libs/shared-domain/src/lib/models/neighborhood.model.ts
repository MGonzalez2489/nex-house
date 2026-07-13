import { NeighStreetModel } from './neigh-street.model';

export interface NeighborhoodModel {
  publicId: string;
  name: string;
  isActive: boolean;
  streets: NeighStreetModel[];
}
