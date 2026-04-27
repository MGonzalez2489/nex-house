import { Neighborhood } from '@database/entities';
import { NeighborhoodModel } from '@nex-house/models';

export function NeighborhoodToModel(neigh: Neighborhood): NeighborhoodModel {
  return {
    name: neigh.name,
    slug: neigh.slug,
    address: neigh.address,
    status: neigh.status,
    publicId: neigh.publicId,
  };
}
