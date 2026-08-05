import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingWelcomeComponent } from "./onboarding-welcome-component";

describe("OnboardingWelcomeComponent", () => {
  let component: OnboardingWelcomeComponent;
  let fixture: ComponentFixture<OnboardingWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingWelcomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingWelcomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
