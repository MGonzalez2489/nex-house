import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResidentStats } from "./resident-stats";

describe("ResidentStats", () => {
  let component: ResidentStats;
  let fixture: ComponentFixture<ResidentStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentStats],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
