import { Component, input, output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CallState } from "@ngrx-toolkit/core";
import {
  NeighborhoodModel,
  UserModel,
  UserProfileModel,
  UserUnitModel,
} from "@nexhouse/shared-domain/models";
import { FormFeedback } from "@shared/components/forms";
import { UserStore } from "@user/user.store";
import { ProfileHomePage } from "./profile-home-page";
import { ProfileInfoForm, ProfileUnit } from "@user/components";

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streets: [],
  address: undefined,
};

const USER: UserModel = {
  publicId: "usr-1",
  email: "user@example.com",
  isFirstAdmin: false,
  requirePwdChange: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  neighborhood: NEIGHBORHOOD,
  userUnits: [],
};

const PROFILE: UserProfileModel = {
  publicId: "prof-1",
  firstName: "Juan",
  lastName: "Pérez",
  fullName: "Juan Pérez",
  phone: "6141234567",
};

const UNITS: UserUnitModel[] = [];

@Component({
  standalone: true,
  selector: "app-profile-info-form",
  template: ``,
})
class StubInfoForm {
  readonly user = input<UserModel>();
  readonly profile = input<UserProfileModel>();
  readonly isLoading = input<boolean>();
  readonly callState = input<CallState>();
  readonly save = output<FormData>();
}

@Component({
  standalone: true,
  selector: "app-profile-unit",
  template: ``,
})
class StubUnit {
  readonly neighborhood = input<NeighborhoodModel>();
  readonly userUnits = input<UserUnitModel[]>();
}

@Component({
  standalone: true,
  selector: "app-form-feedback",
  template: `@if (callState()) {
    <div class="stub-feedback">An error occurred</div>
  }`,
})
class StubFeedback {
  readonly callState = input<CallState>();
}

type StoreLike = {
  user: () => UserModel | undefined;
  profile: () => UserProfileModel | undefined;
  units: () => UserUnitModel[];
  loading: () => boolean;
  callState: () => CallState;
  error: () => unknown;
  update: jest.Mock;
};

describe("ProfileHomePage", () => {
  let fixture: ComponentFixture<ProfileHomePage>;
  let storeStub: StoreLike;

  function configure(store: StoreLike) {
    TestBed.configureTestingModule({
      imports: [ProfileHomePage],
      providers: [
        { provide: UserStore, useValue: store as unknown as typeof UserStore },
      ],
    })
      .overrideComponent(ProfileHomePage, {
        remove: {
          imports: [ProfileInfoForm, ProfileUnit, FormFeedback],
        },
        add: {
          imports: [StubInfoForm, StubUnit, StubFeedback],
        },
      });
  }

  async function mount(): Promise<void> {
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(ProfileHomePage);
    await fixture.whenStable();
  }

  function infoForm(): StubInfoForm {
    const el = fixture.debugElement.query(
      (el) => el.componentInstance instanceof StubInfoForm,
    );
    return el?.componentInstance as StubInfoForm;
  }

  function unit(): StubUnit {
    const el = fixture.debugElement.query(
      (el) => el.componentInstance instanceof StubUnit,
    );
    return el?.componentInstance as StubUnit;
  }

  it("does not render the sections until user and profile are loaded", async () => {
    storeStub = {
      user: () => undefined,
      profile: () => undefined,
      units: () => [],
      loading: () => false,
      callState: () => "loaded",
      error: () => undefined,
      update: jest.fn(),
    };
    configure(storeStub);
    await mount();

    expect(infoForm()).toBeUndefined();
    expect(unit()).toBeUndefined();
  });

  it("shows the error feedback when boot loading fails", async () => {
    storeStub = {
      user: () => undefined,
      profile: () => undefined,
      units: () => [],
      loading: () => false,
      callState: () => ({ error: new Error("boom"), errorMessage: "boom" }),
      error: () => new Error("boom"),
      update: jest.fn(),
    };
    configure(storeStub);
    await mount();

    expect(
      fixture.nativeElement.querySelector(".stub-feedback"),
    ).toBeTruthy();
  });

  it("passes the loaded data to the sections", async () => {
    storeStub = {
      user: () => USER,
      profile: () => PROFILE,
      units: () => UNITS,
      loading: () => false,
      callState: () => "loaded",
      error: () => undefined,
      update: jest.fn(),
    };
    configure(storeStub);
    await mount();

    expect(infoForm()?.user()).toEqual(USER);
    expect(infoForm()?.profile()).toEqual(PROFILE);
    expect(infoForm()?.isLoading()).toBe(false);
    expect(infoForm()?.callState()).toBe("loaded");
    expect(unit()?.userUnits()).toEqual(UNITS);
    expect(unit()?.neighborhood()).toEqual(NEIGHBORHOOD);
  });

  it("forwards form submissions to the store update", async () => {
    storeStub = {
      user: () => USER,
      profile: () => PROFILE,
      units: () => UNITS,
      loading: () => false,
      callState: () => "loaded",
      error: () => undefined,
      update: jest.fn().mockResolvedValue(true),
    };
    configure(storeStub);
    await mount();

    const dto = new FormData();
    infoForm()?.save.emit(dto);

    expect(storeStub.update).toHaveBeenCalledWith(dto);
  });
});