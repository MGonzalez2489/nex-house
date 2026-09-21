import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AuthStore } from "@auth/store";
import { SessionService } from "@core/services";
import { UserRoleEnum, UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { NeighborhoodModel, UserModel } from "@nexhouse/shared-domain/models";
import { ResidentService } from "@residents/services";
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
import { of, throwError } from "rxjs";
import { ResidentHomePage } from "./resident-home-page";

@Component({
  standalone: true,
  template: "",
})
class RouterStubComponent {}

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
  profile: {
    publicId: "p-1",
    firstName: "Juan",
    lastName: "Pérez",
    fullName: "Juan Pérez",
    phone: "",
    createdAt: "",
  },
  role: {
    publicId: "role-1",
    name: UserRoleEnum.RESIDENT,
    displayName: "Residente",
  },
  status: {
    publicId: "s-1",
    name: UserStatusEnum.ACTIVE,
    displayName: "Activo",
  },
  userUnits: [],
};

const PAGINATION = { total: 1, page: 1, lastPage: 1, limit: 10 };

const STATS = {
  summary: { totalUsers: 1 },
  byRole: { [UserRoleEnum.RESIDENT]: 1 },
  byStatus: { [UserStatusEnum.ACTIVE]: 1 },
};

describe("ResidentHomePage", () => {
  let getStats: jest.Mock;
  let getAll: jest.Mock;
  let sessionStub: { isMobile: jest.Mock };
  let router: Router;

  async function configure(sessionIsMobile = false): Promise<void> {
    getStats = jest
      .fn()
      .mockReturnValue(of({ data: STATS, message: "ok" }));
    getAll = jest.fn().mockReturnValue(
      of({
        data: [USER],
        message: "ok",
        meta: PAGINATION,
      }),
    );
    sessionStub = { isMobile: jest.fn().mockReturnValue(sessionIsMobile) };

    await TestBed.configureTestingModule({
      imports: [ResidentHomePage],
      providers: [
        provideRouter([{ path: "**", component: RouterStubComponent }]),
        {
          provide: ResidentService,
          useValue: {
            getStats: () => getStats(),
            getAll: () => getAll(),
            getById: jest
              .fn()
              .mockReturnValue(of({ data: USER, message: "ok" })),
            create: jest
              .fn()
              .mockReturnValue(of({ data: USER, message: "ok" })),
            update: jest
              .fn()
              .mockReturnValue(of({ data: USER, message: "ok" })),
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
        {
          provide: CatalogsStore,
          useValue: {
            UserRoles: () => [],
            UserStatus: () => [],
          } as unknown as typeof CatalogsStore,
        },
        { provide: SessionService, useValue: sessionStub },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  }

  async function createFixture(): Promise<ComponentFixture<ResidentHomePage>> {
    const fixture = TestBed.createComponent(ResidentHomePage);
    await fixture.whenStable();
    return fixture;
  }

  it("should render the loaded residents from the store", async () => {
    await configure();
    const fixture = await createFixture();

    expect(fixture.nativeElement.querySelector("p-table")).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      "resident@example.com",
    );
  });

  it("should load the stats on init", async () => {
    await configure();
    await createFixture();

    expect(getStats).toHaveBeenCalled();
  });

  it("should render the error feedback when the loads fail", async () => {
    await configure();
    getStats.mockReturnValue(throwError(() => new Error("boom")));
    getAll.mockReturnValue(throwError(() => new Error("boom")));

    const fixture = await createFixture();

    expect(
      fixture.nativeElement.querySelector("app-form-feedback"),
    ).toBeTruthy();
  });

  it("should navigate to /residents/new from create", async () => {
    await configure();
    const fixture = await createFixture();

    const navigateSpy = jest.spyOn(router, "navigate");
    fixture.componentInstance.create();

    expect(navigateSpy).toHaveBeenCalledWith(["/residents", "new"]);
  });

  it("should navigate to the edit route from view", async () => {
    await configure();
    const fixture = await createFixture();

    const navigateSpy = jest.spyOn(router, "navigate");
    fixture.componentInstance.view("usr-1");

    expect(navigateSpy).toHaveBeenCalledWith(["/residents", "usr-1", "edit"]);
  });

  it("should show the mobile create action and navigate on tap", async () => {
    await configure(true);
    const fixture = await createFixture();
    const navigateSpy = jest.spyOn(router, "navigate");

    const fab = fixture.nativeElement.querySelector(
      '[aria-label="Registrar nuevo residente"]',
    );

    expect(fab).toBeTruthy();
    (fab as HTMLElement).click();
    expect(navigateSpy).toHaveBeenCalledWith(["/residents", "new"]);
  });
});