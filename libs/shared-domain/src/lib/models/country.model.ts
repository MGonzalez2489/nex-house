import { BaseCatalogModel } from './_base-catalog.model';

export interface CountryModel extends BaseCatalogModel {
  publicId: string;
  name: string;
  displayName: string;
}
