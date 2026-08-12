import { BaseCatalogModel } from './_base-catalog.model';
import { StateModel } from './state.model';

export interface CityModel extends BaseCatalogModel {
  publicId: string;
  name: string;
  displayName: string;

  state: StateModel;
}
