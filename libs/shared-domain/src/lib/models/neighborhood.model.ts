import { BaseModel } from './_base.model';
import { NeighAddressModel } from './neigh-address.model';
import { NeighStreetModel } from './neigh-street.model';

export interface NeighborhoodModel extends BaseModel {
  name: string;
  isActive: boolean;
  streets: NeighStreetModel[];
  address: NeighAddressModel;
}
