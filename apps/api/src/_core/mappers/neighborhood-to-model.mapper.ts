import { Neighborhood } from '@core/database';
import { NeighborhoodModel } from '@nexhouse/shared-domain/models';
import { NeighStreetToModel } from './neigh-street-to-model.mapper';
import { NeighAddressToModelMapper } from './neigh-address-to-model.mapper';

export const NeighborhoodToModelMapper = (
  neigh: Neighborhood,
): NeighborhoodModel => {
  return {
    publicId: neigh.publicId,
    name: neigh.name,
    isActive: neigh.isActive,
    address: neigh.address
      ? NeighAddressToModelMapper(neigh.address)
      : undefined,
    streets: neigh.streets
      ? neigh.streets.map((s) => NeighStreetToModel(s))
      : [],
  };
};
