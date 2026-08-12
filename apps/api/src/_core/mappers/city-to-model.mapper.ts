import { City } from '@core/database';
import { CityModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
import { StateToModelMapper } from './state-to-model.mapper';

export const CityToModelMapper = (city: City): CityModel => {
  return {
    ...CatalogToModelMapper(city),
    state: city.state ?? StateToModelMapper(city.state),
  };
};
