import { BaseCatalogModel } from '@nexhouse/shared-domain/models';

export function CatalogToModelMapper<
  T extends BaseCatalogModel,
  U extends BaseCatalogModel,
>(source: T): U {
  return {
    publicId: source.publicId,
    name: source.name,
    displayName: source.displayName,
  } as U;
}
