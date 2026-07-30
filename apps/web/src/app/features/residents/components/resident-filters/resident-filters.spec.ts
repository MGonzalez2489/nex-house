import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResidentFilters } from "./resident-filters";

describe("ResidentFilters", () => {
  let component: ResidentFilters;
  let fixture: ComponentFixture<ResidentFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
