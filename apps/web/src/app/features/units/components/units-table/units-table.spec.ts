import { UnitModel } from "@nexhouse/shared-domain/models";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UnitsTable } from "./units-table";

const UNIT: UnitModel = {
  publicId: "unit-1",
  identifier: "LOT-001",
  type: { publicId: "type-1", name: "house", displayName: "Casa" },
  street: { publicId: "street-1", name: "calle principal" },
  userUnits: [],
};

describe("UnitsTable", () => {
  let component: UnitsTable;
  let fixture: ComponentFixture<UnitsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("items", [UNIT]);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
