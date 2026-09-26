import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingHomePage } from "./onboarding-home-page";
import { ProfileEditPayload } from "@core/models/profile-edit-payload";
import { OnboardingStepEnum } from "@nexhouse/shared-domain/enums";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";
import {
  OnboardingStepModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";

interface OnboardingStoreLike {
  updateProfile: (dto: ProfileEditPayload) => Promise<unknown>;
  createUnit: (dto: CreateUnit) => Promise<unknown>;
}

interface UserStoreLike {
  loadProfile: () => Promise<unknown>;
  loadUser: () => Promise<unknown>;
  units: () => UserUnitModel[];
}

interface PageLike {
  store: OnboardingStoreLike;
  userStore: UserStoreLike;
  updateProfile: (dto?: ProfileEditPayload) => Promise<void>;
  createUnit: (dto?: CreateUnit) => Promise<void>;
  goNext: () => void;
}

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

  function withStores(): {
    store: OnboardingStoreLike;
    userStore: UserStoreLike;
    page: { updateProfile: (dto?: ProfileEditPayload) => Promise<void>; createUnit: (dto?: CreateUnit) => Promise<void> };
  } {
    const page = component as unknown as PageLike;
    return { store: page.store, userStore: page.userStore, page };
  }

  function prepareWizard(fromStep: OnboardingStepEnum): void {
    const steps: OnboardingStepModel[] = [
      { id: OnboardingStepEnum.WELCOME, label: "Bienvenida", completed: true, required: true },
      {
        id: OnboardingStepEnum.SECURITY,
        label: "Seguridad",
        completed: fromStep === OnboardingStepEnum.SECURITY,
        required: false,
      },
      {
        id: OnboardingStepEnum.GENERAL_FORM,
        label: "Información General",
        completed: fromStep === OnboardingStepEnum.GENERAL_FORM,
        required: true,
      },
      {
        id: OnboardingStepEnum.CREATE_UNIT,
        label: "Tu Unidad",
        completed: fromStep === OnboardingStepEnum.CREATE_UNIT,
        required: true,
      },
      { id: OnboardingStepEnum.COMPLETE, label: "Finalizar", completed: false, required: true },
    ];
    component.steps.set(steps);
    component.currentStepId.set(fromStep);
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("step progress", () => {
    it("renders no progress indicator while the steps are unknown", () => {
      component.steps.set([]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector("p-progressbar")).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain("Paso ");
    });

    it("renders the current step number, the total and the step label", async () => {
      prepareWizard(OnboardingStepEnum.GENERAL_FORM);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentStepNumber()).toBe(3);
      expect(component.totalSteps()).toBe(5);
      expect(component.progressPercent()).toBe(60);

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain("Paso 3 de 5");
      expect(text).toContain("Información General");
    });

    it("keeps the stepper navigation out of the page", async () => {
      prepareWizard(OnboardingStepEnum.WELCOME);
      fixture.detectChanges();
      await fixture.whenStable();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector("p-step-list")).toBeNull();
      expect(el.querySelector("p-step")).toBeNull();
      // Only the active step's panel content is reachable through the panels.
      expect(el.querySelectorAll("p-step-panel").length).toBe(5);
    });

    it("recomputes the indicator when the step changes", () => {
      prepareWizard(OnboardingStepEnum.WELCOME);
      expect(component.currentStepNumber()).toBe(1);
      expect(component.progressPercent()).toBe(20);

      (component as unknown as PageLike).goNext();

      expect(component.currentStepNumber()).toBe(2);
      expect(component.currentStepLabel()).toBe("Seguridad");
      expect(component.progressPercent()).toBe(40);
    });

    it("reports zero progress when the store has no steps", () => {
      component.steps.set([]);
      component.currentStepId.set(OnboardingStepEnum.WELCOME);

      expect(component.totalSteps()).toBe(0);
      expect(component.currentStepNumber()).toBe(0);
      expect(component.progressPercent()).toBe(0);
      expect(component.currentStepLabel()).toBe("");
    });
  });

  describe("updateProfile", () => {
    it("advances without a request when the payload is unchanged", async () => {
      prepareWizard(OnboardingStepEnum.GENERAL_FORM);
      const { store, userStore, page } = withStores();
      const updateSpy = jest.spyOn(store, "updateProfile");
      const loadSpy = jest.spyOn(userStore, "loadProfile");

      await page.updateProfile({});

      expect(updateSpy).not.toHaveBeenCalled();
      expect(loadSpy).not.toHaveBeenCalled();
      expect(component.currentStepId()).toBe(OnboardingStepEnum.CREATE_UNIT);
    });

    it("submits the profile when the payload has changes", async () => {
      prepareWizard(OnboardingStepEnum.GENERAL_FORM);
      const { store, userStore, page } = withStores();
      const updateSpy = jest
        .spyOn(store, "updateProfile")
        .mockResolvedValue(undefined);
      const loadSpy = jest
        .spyOn(userStore, "loadProfile")
        .mockResolvedValue(undefined);

      const dto: ProfileEditPayload = { firstName: "Ana" };
      await page.updateProfile(dto);

      expect(updateSpy).toHaveBeenCalledWith(dto);
      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe("createUnit", () => {
    it("advances without a request when the user already has a unit", async () => {
      prepareWizard(OnboardingStepEnum.CREATE_UNIT);
      const { store, userStore, page } = withStores();
      const createSpy = jest.spyOn(store, "createUnit");
      jest.spyOn(userStore, "units").mockReturnValue([{} as UserUnitModel]);

      await page.createUnit({} as CreateUnit);

      expect(createSpy).not.toHaveBeenCalled();
      expect(component.currentStepId()).toBe(OnboardingStepEnum.COMPLETE);
    });

    it("creates the unit when the user has none assigned", async () => {
      prepareWizard(OnboardingStepEnum.CREATE_UNIT);
      const { store, userStore, page } = withStores();
      const createSpy = jest
        .spyOn(store, "createUnit")
        .mockResolvedValue(undefined);
      const loadSpy = jest
        .spyOn(userStore, "loadUser")
        .mockResolvedValue(undefined);

      await page.createUnit({} as CreateUnit);

      expect(createSpy).toHaveBeenCalled();
      expect(loadSpy).toHaveBeenCalled();
    });
  });
});