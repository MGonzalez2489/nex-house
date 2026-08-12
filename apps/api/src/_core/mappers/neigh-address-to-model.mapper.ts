import { NeighAddress } from '@core/database';
import { NeighAddressModel } from '@nexhouse/shared-domain/models';
import { CatalogToModelMapper } from './catalog-to-model.mapper';

export const NeighAddressToModelMapper = (
  address: NeighAddress,
): NeighAddressModel => {
  return {
    zipCode: address.zipCode,
    latitude: address.latitude,
    longitud: address.longitude,
    publicId: address.publicId,
    city: address.city ?? CatalogToModelMapper(address.city),
  };
};
