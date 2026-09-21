/* eslint-disable @angular-eslint/component-selector */
import { Component, input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  NeighborhoodModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";
import { Panel } from "@openng/optimus-ui/panel";
import { ProfileUnit } from "./profile-unit";

@Component({
  standalone: true,
  selector: "p-panel",
  template: `<ng-content />`,
})
class StubPanel {
  readonly header = input<string>();
}

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streets: [],
  address: undefined,
};

const CURRENT: UserUnitModel = {
  publicId: "uu-1",
  isCurrentOccupant: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userUnitRole: {
    publicId: "ur-1",
    name: "owner",
    displayName: "Propietario",
  },
  unit: {
    publicId: "unit-1",
    identifier: "C-101",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    street: {
      publicId: "st-1",
      name: "Av. Principal",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    type: {
      publicId: "tp-1",
      name: "casa",
      displayName: "Casa",
    },
    userUnits: [],
  },
};

const SECONDARY: UserUnitModel = {
  ...CURRENT,
  publicId: "uu-2",
  isCurrentOccupant: false,
  unit: {
    ...CURRENT.unit,
    publicId: "unit-2",
    identifier: "C-102",
  },
};

describe("ProfileUnit", () => {
  let fixture: ComponentFixture<ProfileUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileUnit],
    })
      .overrideComponent(ProfileUnit, {
        remove: { imports: [Panel] },
        add: { imports: [StubPanel] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileUnit);
  });

  it("shows an empty state when no units are assigned", async () => {
    fixture.componentRef.setInput("userUnits", []);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      "No hay unidad asignada",
    );
  });

  it("shows the neighborhood when provided", async () => {
    fixture.componentRef.setInput("userUnits", [CURRENT]);
    fixture.componentRef.setInput("neighborhood", NEIGHBORHOOD);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("La Hacienda");
  });

  it("falls back to an em dash when the neighborhood is missing", async () => {
    fixture.componentRef.setInput("userUnits", [CURRENT]);
    fixture.componentRef.setInput("neighborhood", undefined);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("—");
  });

  it("renders each assigned unit with its street, identifier and role", async () => {
    fixture.componentRef.setInput("userUnits", [CURRENT, SECONDARY]);
    fixture.componentRef.setInput("neighborhood", NEIGHBORHOOD);
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Av. Principal C-101");
    expect(text).toContain("Av. Principal C-102");
    expect(text).toContain("Propietario");
  });

  it("tags the current occupant unit", async () => {
    fixture.componentRef.setInput("userUnits", [CURRENT, SECONDARY]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      "Residencia actual",
    );
  });

  it("does not tag the current occupant when nothing is the current occupant", async () => {
    fixture.componentRef.setInput("userUnits", [SECONDARY]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).not.toContain(
      "Residencia actual",
    );
  });
});