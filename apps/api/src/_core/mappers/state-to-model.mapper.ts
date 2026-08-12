import { State } from '@core/database';
import { StateModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';
import { CountryToModelMapper } from './country-to-model.mapper';

export const StateToModelMapper = (state: State): StateModel => {
  return {
    ...CatalogToModelMapper(state),
    country: state.country ?? CountryToModelMapper(state.country),
  };
};
