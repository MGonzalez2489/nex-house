import { TestBed } from "@angular/core/testing";
import { AuthStore } from "@auth/store";
import { ProfileService } from "@core/services";
import { UserRoleEnum, UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { of, throwError } from "rxjs";
import { UserStore } from "./user.store";
import { UserService } from "./services";

const USER = {
  publicId: "usr-1",
  email: "user@example.com",
  isFirstAdmin: false,
  requirePwdChange: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: {
    publicId: "status-1",
    name: UserStatusEnum.ACTIVE,
    displayName: "Activo",
  },
  role: {
    publicId: "role-1",
    name: UserRoleEnum.ADMIN,
    displayName: "Administrador",
  },
  neighborhood: { publicId: "nb-1", name: "La Hacienda" },
  userUnits: [
    {
      publicId: "uu-1",
      isCurrentOccupant: true,
      userUnitRole: { publicId: "ur-1", name: "OWNER", displayName: "Dueño" },
      unit: {
        publicId: "unit-1",
        identifier: "C-101",
        type: { publicId: "tp-1", name: "CASA", displayName: "Casa" },
        street: {
          publicId: "st-1",
          name: "Av. Principal",
          neighborhood: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    },
  ],
};

const PROFILE = {
  publicId: "prof-1",
  firstName: "Juan",
  lastName: "Pérez",
  fullName: "Juan Pérez",
  phone: "6141234567",
};

describe("UserStore", () => {
  let store: InstanceType<typeof UserStore>;
  let getUser: jest.Mock;
  let getProfile: jest.Mock;
  let updateProfile: jest.Mock;

  beforeEach(() => {
    getUser = jest.fn().mockReturnValue(of({ data: USER, message: "ok" }));
    getProfile = jest.fn().mockReturnValue(of({ data: PROFILE, message: "ok" }));
    updateProfile = jest.fn().mockReturnValue(of({ data: PROFILE, message: "ok" }));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: {
            get: () => getUser(),
          },
        },
        {
          provide: ProfileService,
          useValue: {
            get: () => getProfile(),
            update: () => updateProfile(),
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => true,
          } as unknown as typeof AuthStore,
        },
      ],
    });

    store = TestBed.inject(UserStore);
  });

  it("loadProfile stores the profile and reports success", async () => {
    const ok = await store.loadProfile();

    expect(ok).toBe(true);
    expect(store.profile()).toEqual(PROFILE);
    expect(store.loaded()).toBe(true);
  });

  it("loadProfile returns false and sets an error on failure", async () => {
    getProfile.mockReturnValue(throwError(() => new Error("boom")));

    const ok = await store.loadProfile();

    expect(ok).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("loadUser splits status, role and units into their own slices", async () => {
    const ok = await store.loadUser();

    expect(ok).toBe(true);
    expect(store.user()).toEqual(
      expect.not.objectContaining({
        status: expect.anything(),
        role: expect.anything(),
      }),
    );
    expect(store.user()?.userUnits).toEqual([]);
    expect(store.user()).toMatchObject({
      publicId: "usr-1",
      email: "user@example.com",
      neighborhood: USER.neighborhood,
    });
    expect(store.status()?.name).toBe(UserStatusEnum.ACTIVE);
    expect(store.role()?.name).toBe(UserRoleEnum.ADMIN);
    expect(store.units()).toHaveLength(1);
    expect(store.loaded()).toBe(true);
  });

  it("loadUser does not mutate the API payload it normalizes", async () => {
    await store.loadUser();

    expect(USER.status).toBeDefined();
    expect(USER.role).toBeDefined();
    expect(USER.userUnits).toHaveLength(1);
    expect(USER.userUnits[0]?.unit.identifier).toBe("C-101");
  });

  it("loadUser returns false and sets an error on failure", async () => {
    getUser.mockReturnValue(throwError(() => new Error("boom")));

    const ok = await store.loadUser();

    expect(ok).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("update patches the profile and returns true on success", async () => {
    const updated = { ...PROFILE, firstName: "Maria" };
    updateProfile.mockReturnValue(of({ data: updated, message: "ok" }));

    const ok = await store.update(new FormData());

    expect(ok).toBe(true);
    expect(store.profile()).toEqual(updated);
    expect(store.loaded()).toBe(true);
  });

  it("update returns false and sets an error on failure", async () => {
    updateProfile.mockReturnValue(throwError(() => new Error("boom")));

    const ok = await store.update(new FormData());

    expect(ok).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("resetState clears the loaded slices", () => {
    store.loadProfile();
    store.loadUser();

    store.resetState();

    expect(store.user()).toBeUndefined();
    expect(store.profile()).toBeUndefined();
    expect(store.status()).toBeUndefined();
    expect(store.role()).toBeUndefined();
    expect(store.units()).toEqual([]);
  });
});