import {
  CreateNeighborhood,
  UpdateNeighStreet,
  UpdateNeighborhood,
} from "@nexhouse/shared-domain/interfaces";

export interface StreetFormValues {
  name: string;
  publicId: string | null;
}

export interface NeighborhoodFormValues {
  name: string;
  active: boolean;
  firstAdminEmail: string;
  cityId: string;
  zipCode: string;
  streets: StreetFormValues[];
}

/**
 * Builds the `CreateNeighborhood` payload discarding the untracked country/state
 * selectors and normalizing street entries (no `publicId` on brand-new streets).
 */
export function mapCreateNeighborhoodPayload(
  values: NeighborhoodFormValues,
): CreateNeighborhood {
  return {
    name: values.name.trim(),
    adminEmail: values.firstAdminEmail.trim(),
    streets: values.streets.map((street) => ({ name: street.name.trim() })),
    isActive: values.active,
    cityId: values.cityId,
    zipCode: values.zipCode,
  };
}

/**
 * Builds the `UpdateNeighborhood` payload; street `publicId` is only included
 * for streets that already exist so the API can diff create/update/remove.
 */
export function mapUpdateNeighborhoodPayload(
  values: Pick<NeighborhoodFormValues, "name" | "active" | "streets">,
): UpdateNeighborhood {
  const streets: UpdateNeighStreet[] = values.streets.map((street) => {
    const entry: UpdateNeighStreet = { name: street.name.trim() };
    if (street.publicId) {
      entry.publicId = street.publicId;
    }
    return entry;
  });

  return {
    name: values.name.trim(),
    isActive: values.active,
    streets,
  };
}