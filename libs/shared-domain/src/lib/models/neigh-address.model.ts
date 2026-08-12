import { BaseModel } from './_base.model';
import { CityModel } from './city.model';

export interface NeighAddressModel extends BaseModel {
  zipCode: string;
  latitude: number;
  longitud: number;

  city: CityModel;
}
