import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighTableFilters } from "./neigh-table-filters";

describe("NeighTableFilters", () => {
  let component: NeighTableFilters;
  let fixture: ComponentFixture<NeighTableFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighTableFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighTableFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
