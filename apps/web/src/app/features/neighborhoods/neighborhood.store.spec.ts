import { TestBed } from "@angular/core/testing";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { NeighborhoodService } from "./services";
import { NeighborhoodsStore } from "./neighborhood.store";
import { of, throwError } from "rxjs";

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streets: [],
  address: undefined,
};

const PAGINATION_META = { total: 1, page: 1, lastPage: 1, limit: 10 };

describe("NeighborhoodsStore", () => {
  let store: InstanceType<typeof NeighborhoodsStore>;
  let getAll: jest.Mock;
  let getById: jest.Mock;
  let create: jest.Mock;
  let update: jest.Mock;

  beforeEach(() => {
    getAll = jest.fn().mockReturnValue(of([]));
    getById = jest.fn().mockReturnValue(of(undefined));
    create = jest.fn().mockReturnValue(of(undefined));
    update = jest.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: NeighborhoodService,
          useValue: {
            getAll: () => getAll(),
            getById: () => getById(),
            create: () => create(),
            update: () => update(),
          },
        },
      ],
    });

    store = TestBed.inject(NeighborhoodsStore);
  });

  it("loadAll replaces the entities and stores the pagination meta", () => {
    getAll.mockReturnValue(
      of({ data: [NEIGHBORHOOD], message: "ok", meta: PAGINATION_META }),
    );

    store.loadAll({ first: 0, rows: 10 });

    expect(store.entities()).toEqual([NEIGHBORHOOD]);
    expect(store.pagination()?.total).toBe(1);
    expect(store.loaded()).toBe(true);
  });

  it("loadAll sets an error state when the request fails", () => {
    getAll.mockReturnValue(throwError(() => new Error("boom")));

    store.loadAll({ first: 0, rows: 10 });

    expect(store.loaded()).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("findById resolves from the cache without hitting the API", async () => {
    getAll.mockReturnValue(
      of({ data: [NEIGHBORHOOD], message: "ok", meta: PAGINATION_META }),
    );
    store.loadAll({ first: 0, rows: 10 });

    const result = await store.findById("nb-1");

    expect(result).toEqual(NEIGHBORHOOD);
    expect(getById).not.toHaveBeenCalled();
  });

  it("findById fetches and adds the entity when it is not cached", async () => {
    getById.mockReturnValue(of({ data: NEIGHBORHOOD, message: "ok" }));

    const result = await store.findById("nb-1");

    expect(result).toEqual(NEIGHBORHOOD);
    expect(store.entities()).toContainEqual(NEIGHBORHOOD);
  });

  it("create calls the API and adds the created entity on success", async () => {
    create.mockReturnValue(of({ data: NEIGHBORHOOD, message: "ok" }));

    const ok = await store.create({ name: "La Hacienda", isActive: true });

    expect(ok).toBe(true);
    expect(store.entities()).toContainEqual(NEIGHBORHOOD);
  });

  it("create returns false and sets an error on failure", async () => {
    create.mockReturnValue(throwError(() => new Error("boom")));

    const ok = await store.create({ name: "La Hacienda", isActive: true });

    expect(ok).toBe(false);
    expect(store.error()).toBeTruthy();
  });

  it("update applies the response changes to the entity", async () => {
    getAll.mockReturnValue(
      of({ data: [NEIGHBORHOOD], message: "ok", meta: PAGINATION_META }),
    );
    store.loadAll({ first: 0, rows: 10 });

    update.mockReturnValue(
      of({
        data: { ...NEIGHBORHOOD, isActive: false },
        message: "ok",
      }),
    );

    const ok = await store.update("nb-1", { name: "La Hacienda" });

    expect(ok).toBe(true);
    expect(store.entities()[0]?.isActive).toBe(false);
  });

  it("resetState clears entities after a logout-driven reset", () => {
    getAll.mockReturnValue(
      of({ data: [NEIGHBORHOOD], message: "ok", meta: PAGINATION_META }),
    );
    store.loadAll({ first: 0, rows: 10 });

    store.resetState();

    expect(store.entities()).toEqual([]);
    expect(store.pagination()).toBeUndefined();
  });
});