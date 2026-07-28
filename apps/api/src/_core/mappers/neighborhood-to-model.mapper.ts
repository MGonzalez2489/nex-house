import { Neighborhood } from '@core/database';
import { NeighborhoodModel } from '@nexhouse/shared-domain/models';
import { NeighStreetToModel } from './neigh-street-to-model.mapper';

export const NeighborhoodToModelMapper = (
  neigh: Neighborhood,
): NeighborhoodModel => {
  return {
    publicId: neigh.publicId,
    name: neigh.name,
    isActive: false,
    streets: neigh.streets
      ? neigh.streets.map((s) => NeighStreetToModel(s))
      : [],
  };
};
