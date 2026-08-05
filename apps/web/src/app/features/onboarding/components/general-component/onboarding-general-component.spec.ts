import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingGeneralComponent } from "./onboarding-general-component";

describe("OnboardingGeneralComponent", () => {
  let component: OnboardingGeneralComponent;
  let fixture: ComponentFixture<OnboardingGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingGeneralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingGeneralComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
