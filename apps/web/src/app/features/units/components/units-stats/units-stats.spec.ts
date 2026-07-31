import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UnitsStats } from "./units-stats";

describe("UnitsStats", () => {
  let component: UnitsStats;
  let fixture: ComponentFixture<UnitsStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitsStats],
    }).compileComponents();

    fixture = TestBed.createComponent(UnitsStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
