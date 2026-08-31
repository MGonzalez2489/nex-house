import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingUnitComponent } from "./onboarding-unit-component";

describe("OnboardingUnitComponent", () => {
  let component: OnboardingUnitComponent;
  let fixture: ComponentFixture<OnboardingUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingUnitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingUnitComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
