import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResidentDashboard } from "./resident-dashboard";

describe("ResidentDashboard", () => {
  let component: ResidentDashboard;
  let fixture: ComponentFixture<ResidentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
