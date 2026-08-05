import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingFinishComponent } from "./onboarding-finish-component";

describe("OnboardingFinishComponent", () => {
  let component: OnboardingFinishComponent;
  let fixture: ComponentFixture<OnboardingFinishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingFinishComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingFinishComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
