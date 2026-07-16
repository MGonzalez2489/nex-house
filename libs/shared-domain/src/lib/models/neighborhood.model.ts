import { BaseModel } from './_base.model';
import { NeighStreetModel } from './neigh-street.model';

export interface NeighborhoodModel extends BaseModel {
  publicId: string;
  name: string;
  isActive: boolean;
  streets: NeighStreetModel[];
}
