import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UnitsFilters } from "./units-filters";

describe("UnitsFilters", () => {
  let component: UnitsFilters;
  let fixture: ComponentFixture<UnitsFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
