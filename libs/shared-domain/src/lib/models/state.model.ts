import { BaseCatalogModel } from './_base-catalog.model';
import { CountryModel } from './country.model';

export interface StateModel extends BaseCatalogModel {
  publicId: string;
  name: string;
  displayName: string;
  country: CountryModel;
}
