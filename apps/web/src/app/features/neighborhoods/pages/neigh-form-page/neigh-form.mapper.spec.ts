import {
  mapCreateNeighborhoodPayload,
  mapUpdateNeighborhoodPayload,
} from "./neigh-form.mapper";

const VALUES = {
  name: "  La Hacienda  ",
  active: true,
  firstAdminEmail: "  admin@nexhouse.mx  ",
  cityId: "ci-1",
  zipCode: "31200",
  streets: [
    { name: "  Calle A  ", publicId: "st-1" },
    { name: "Calle B", publicId: null },
  ],
};

describe("neighFormMapper", () => {
  it("mapCreateNeighborhoodPayload trims and discards country/state", () => {
    const payload = mapCreateNeighborhoodPayload(VALUES as never);

    expect(payload).toEqual({
      name: "La Hacienda",
      adminEmail: "admin@nexhouse.mx",
      streets: [{ name: "Calle A" }, { name: "Calle B" }],
      isActive: true,
      cityId: "ci-1",
      zipCode: "31200",
    });
  });

  it("mapCreateNeighborhoodPayload drops street publicIds (brand new streets)", () => {
    const payload = mapCreateNeighborhoodPayload(VALUES as never);

    expect(payload.streets).toHaveLength(2);
    expect(payload.streets[0]).toEqual({ name: "Calle A" });
  });

  it("mapUpdateNeighborhoodPayload only sends editable fields", () => {
    const payload = mapUpdateNeighborhoodPayload({
      name: "  La Hacienda  ",
      active: false,
      streets: VALUES.streets,
    });

    expect(payload).toEqual({
      name: "La Hacienda",
      isActive: false,
      streets: [
        { name: "Calle A", publicId: "st-1" },
        { name: "Calle B" },
      ],
    });
  });

  it("mapUpdateNeighborhoodPayload omits publicId when the street is new", () => {
    const payload = mapUpdateNeighborhoodPayload({
      name: "X",
      active: true,
      streets: [{ name: "Calle B", publicId: null }],
    });

    expect(payload.streets).toEqual([{ name: "Calle B" }]);
  });
});