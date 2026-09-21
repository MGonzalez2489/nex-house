import { TestBed } from "@angular/core/testing";
import { AuthStore } from "@auth/store";
import { UserRoleEnum } from "@nexhouse/shared-domain/enums";
import { NeighborhoodModel, UserModel } from "@nexhouse/shared-domain/models";
import { ContextStore } from "@stores/context.store";
import { of, throwError } from "rxjs";
import { ResidentStore } from "./resident.store";
import { ResidentService } from "./services";

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
  email: "resident@example.com",
  isFirstAdmin: false,
  requirePwdChange: false,
  createdAt: new Date().toISOString(),
  role: {
    publicId: "role-1",
    name: UserRoleEnum.RESIDENT,
    displayName: "Residente",
  },
  userUnits: [],
};

const PAGINATION_META = { total: 1, page: 1, lastPage: 1, limit: 10 };

const STATS = {
  summary: { totalUsers: 1 },
  byRole: { [UserRoleEnum.RESIDENT]: 1 },
  byStatus: { active: 1 },
};

describe("ResidentStore", () => {
  let store: InstanceType<typeof ResidentStore>;
  let getStats: jest.Mock;
  let getAll: jest.Mock;
  let getById: jest.Mock;
  let create: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    getStats = jest.fn().mockReturnValue(of({ data: STATS, message: "ok" }));
    getAll = jest.fn().mockReturnValue(of({ data: [], message: "ok" }));
    getById = jest.fn().mockReturnValue(of(undefined));
    create = jest.fn().mockReturnValue(of(undefined));
    update = jest.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ResidentService,
          useValue: {
            getStats: () => getStats(),
            getAll: () => getAll(),
            getById: () => getById(),
            create: () => create(),
            update: () => update(),
          },
        },
        {
          provide: ContextStore,
          useValue: {
            neighborhood: () => NEIGHBORHOOD,
          } as unknown as typeof ContextStore,
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => true,
          } as unknown as typeof AuthStore,
        },
      ],
    });

    store = TestBed.inject(ResidentStore);
  });

  it("loadStats stores the aggregated stats", () => {
    store.loadStats();

    expect(store.stats()).toEqual(STATS);
    expect(store.loaded()).toBe(true);
  });

  it("loadStats sets an error state when the request fails", () => {
    getStats.mockReturnValue(throwError(() => new Error("boom")));

    store.loadStats();

    expect(store.error()).toBeTruthy();
  });

  it("loadAll replaces the entities and stores the pagination meta", () => {
    getAll.mockReturnValue(
      of({ data: [USER], message: "ok", meta: PAGINATION_META }),
    );

    store.loadAll({ first: 0, rows: 10 });

    expect(store.entities()).toEqual([USER]);
    expect(store.pagination()?.total).toBe(1);
    expect(store.loaded()).toBe(true);
  });

  it("loadAll sets an error state when the request fails", () => {
    getAll.mockReturnValue(throwError(() => new Error("boom")));

    store.loadAll({ first: 0, rows: 10 });

    expect(store.loaded()).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("loadById resolves from the cache without hitting the API", async () => {
    getAll.mockReturnValue(
      of({ data: [USER], message: "ok", meta: PAGINATION_META }),
    );
    store.loadAll({ first: 0, rows: 10 });

    const result = await store.loadById("usr-1");

    expect(result).toEqual(USER);
    expect(getById).not.toHaveBeenCalled();
  });

  it("loadById fetches and adds the entity when it is not cached", async () => {
    getById.mockReturnValue(of({ data: USER, message: "ok" }));

    const result = await store.loadById("usr-1");

    expect(result).toEqual(USER);
    expect(store.entities()).toContainEqual(USER);
  });

  it("loadById returns null and sets an error on failure", async () => {
    getById.mockReturnValue(throwError(() => new Error("boom")));

    const result = await store.loadById("usr-1");

    expect(result).toBeNull();
    expect(store.error()).toBeTruthy();
  });

  it("create calls the API, adds the created entity and refreshes stats", async () => {
    create.mockReturnValue(of({ data: USER, message: "ok" }));

    const ok = await store.create({
      email: "resident@example.com",
      userRoleId: "role-1",
      unit: {
        streetId: "st-1",
        unitIdentifier: "D-101",
        unitTypeId: "unit-type-1",
        unitRoleId: "unit-role-1",
        isCurrentOccupant: true,
      },
    });

    expect(ok).toBe(true);
    expect(store.entities()).toContainEqual(USER);
    expect(getStats).toHaveBeenCalled();
  });

  it("create returns false and sets an error on failure", async () => {
    create.mockReturnValue(throwError(() => new Error("boom")));

    const ok = await store.create({
      email: "resident@example.com",
      userRoleId: "role-1",
      unit: {
        streetId: "st-1",
        unitIdentifier: "D-101",
        unitTypeId: "unit-type-1",
        unitRoleId: "unit-role-1",
        isCurrentOccupant: true,
      },
    });

    expect(ok).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("update applies the response changes to the cached entity", async () => {
    getAll.mockReturnValue(
      of({ data: [USER], message: "ok", meta: PAGINATION_META }),
    );
    store.loadAll({ first: 0, rows: 10 });

    update.mockReturnValue(
      of({
        data: { ...USER, email: "updated@example.com" },
        message: "ok",
      }),
    );

    const ok = await store.update("usr-1", { userRoleId: "role-2" });

    expect(ok).toBe(true);
    expect(store.entities()[0]?.email).toBe("updated@example.com");
  });

  it("update returns false and sets an error on failure", async () => {
    update.mockReturnValue(throwError(() => new Error("boom")));

    const ok = await store.update("usr-1", { userRoleId: "role-2" });

    expect(ok).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("resetState clears entities, pagination and stats", () => {
    store.loadStats();
    getAll.mockReturnValue(
      of({ data: [USER], message: "ok", meta: PAGINATION_META }),
    );
    store.loadAll({ first: 0, rows: 10 });

    store.resetState();

    expect(store.entities()).toEqual([]);
    expect(store.pagination()).toBeUndefined();
    expect(store.stats()).toBeUndefined();
  });
});