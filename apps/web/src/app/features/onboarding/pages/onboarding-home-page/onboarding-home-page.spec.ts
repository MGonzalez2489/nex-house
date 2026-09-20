import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OnboardingHomePage } from "./onboarding-home-page";
import { OnboardingStepEnum } from "@nexhouse/shared-domain/enums";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";
import {
  OnboardingStepModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";

interface OnboardingStoreLike {
  updateProfile: (dto: FormData) => Promise<unknown>;
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
  updateProfile: (dto?: FormData) => Promise<void>;
  createUnit: (dto?: CreateUnit) => Promise<void>;
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
    page: { updateProfile: (dto?: FormData) => Promise<void>; createUnit: (dto?: CreateUnit) => Promise<void> };
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

  describe("updateProfile", () => {
    it("advances without a request when the payload is unchanged", async () => {
      prepareWizard(OnboardingStepEnum.GENERAL_FORM);
      const { store, userStore, page } = withStores();
      const updateSpy = jest.spyOn(store, "updateProfile");
      const loadSpy = jest.spyOn(userStore, "loadProfile");

      await page.updateProfile(new FormData());

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

      const dto = new FormData();
      dto.append("firstName", "Ana");
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