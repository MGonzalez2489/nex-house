import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingHomePage } from "./onboarding-home-page";

describe("OnboardingHomePage", () => {
  let component: OnboardingHomePage;
  let fixture: ComponentFixture<OnboardingHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
