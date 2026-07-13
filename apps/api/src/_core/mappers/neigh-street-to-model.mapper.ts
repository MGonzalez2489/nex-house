import { NeighStreet } from '@core/database';
import { NeighStreetModel } from '@nexhouse/shared-domain/models';

export const NeighStreetToModel = (street: NeighStreet): NeighStreetModel => {
  return {
    name: street.name,
  };
};
