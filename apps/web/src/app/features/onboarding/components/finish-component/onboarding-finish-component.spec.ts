import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingFinishComponent } from "./onboarding-finish-component";
import {
  UserModel,
  UserProfileModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";

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

  it("greets the user by their first name", async () => {
    fixture.componentRef.setInput("profile", {
      firstName: "Ana",
      fullName: "Ana López",
    } as UserProfileModel);
    fixture.componentRef.setInput("user", { email: "ana@nexhouse.com" } as UserModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("¡Todo listo, Ana!");
    expect(fixture.nativeElement.textContent).toContain("ana@nexhouse.com");
  });

  it("falls back to a generic greeting when no profile name exists", async () => {
    fixture.componentRef.setInput("user", { email: "ana@nexhouse.com" } as UserModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("¡Todo listo!");
  });

  it("renders the information of the assigned unit", async () => {
    fixture.componentRef.setInput(
      "units",
      [
        {
          isCurrentOccupant: true,
          userUnitRole: { displayName: "Propietario" },
          unit: {
            identifier: "B-101",
            street: { name: "Av. Central" },
            type: { displayName: "Casa" },
          },
        } as unknown as UserUnitModel,
      ],
    );
    fixture.componentRef.setInput("profile", {
      firstName: "Ana",
      fullName: "Ana López",
    } as UserProfileModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("B-101");
    expect(fixture.nativeElement.textContent).toContain("Av. Central");
    expect(fixture.nativeElement.textContent).toContain("Casa");
    expect(fixture.nativeElement.textContent).toContain("Propietario");
    expect(fixture.nativeElement.textContent).toContain("Sí");
  });

  it("shows No de ocupación when the user does not live in the unit", async () => {
    fixture.componentRef.setInput(
      "units",
      [
        {
          isCurrentOccupant: false,
          userUnitRole: { displayName: "Inquilino" },
          unit: { identifier: "B-101" },
        } as unknown as UserUnitModel,
      ],
    );
    fixture.componentRef.setInput("user", { email: "ana@nexhouse.com" } as UserModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("Inquilino");
    expect(fixture.nativeElement.textContent).toContain("No");
  });

  it("shows a friendly hint when the user has no unit yet", async () => {
    fixture.componentRef.setInput("user", { email: "ana@nexhouse.com" } as UserModel);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      "Aún no tienes una unidad asignada",
    );
  });

  it("emits complete when Ir al Dashboard is clicked", () => {
    const spy = jest.fn();
    component.complete.subscribe(spy);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll("button"),
    ) as HTMLButtonElement[];
    const dashboardButton = buttons.find((button) =>
      button.textContent?.includes("Ir al Dashboard"),
    );
    expect(dashboardButton).toBeTruthy();
    dashboardButton?.click();

    expect(spy).toHaveBeenCalled();
  });
});