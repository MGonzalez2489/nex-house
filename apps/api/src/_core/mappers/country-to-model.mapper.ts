import { Country } from '@core/database';
import { CountryModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';

export const CountryToModelMapper = (country: Country): CountryModel => {
  return {
    ...CatalogToModelMapper(country),
  };
};
