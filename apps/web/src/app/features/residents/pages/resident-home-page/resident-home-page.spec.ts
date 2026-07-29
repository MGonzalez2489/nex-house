import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResidentHomePage } from "./resident-home-page";

describe("ResidentHomePage", () => {
  let component: ResidentHomePage;
  let fixture: ComponentFixture<ResidentHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
