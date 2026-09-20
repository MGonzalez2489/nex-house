import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingPwdChangeComponent } from "./onboarding-pwd-change-component";

describe("OnboardingPwdChangeComponent", () => {
  let component: OnboardingPwdChangeComponent;
  let fixture: ComponentFixture<OnboardingPwdChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingPwdChangeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPwdChangeComponent);
    fixture.componentRef.setInput("isLoading", false);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
