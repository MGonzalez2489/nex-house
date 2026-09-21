import { Component } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
} from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { UserRoleEnum, UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { CreateUnit } from "@nexhouse/shared-domain/interfaces";
import { BaseCatalogModel, UserModel } from "@nexhouse/shared-domain/models";
import { CatalogsStore } from "@stores/catalogs.store";
import { ContextStore } from "@stores/context.store";
import { UnitStore } from "@units/units.store";
import { ResidentStore } from "@residents/resident.store";
import { ResidentFormPage } from "./resident-form-page";

@Component({
  standalone: true,
  template: "",
})
class RouterStubComponent {}

const ROLES: BaseCatalogModel[] = [
  { publicId: "role-1", name: UserRoleEnum.RESIDENT, displayName: "Residente" },
  { publicId: "role-2", name: "admin", displayName: "Administrador" },
];

const STATUSES: BaseCatalogModel[] = [
  { publicId: "s-1", name: UserStatusEnum.ACTIVE, displayName: "Activo" },
];

interface FormPageLike {
  form: {
    controls: {
      email: { value: string; setValue: (v: string) => void; disabled: boolean };
      userRoleId: { value: string; setValue: (v: string) => void };
      unit: { value: CreateUnit | null; setValue: (v: CreateUnit | null) => void };
    };
  };
  submit(): Promise<void>;
  cancel(): void;
}

const USER: UserModel = {
  publicId: "usr-1",
  email: "resident@example.com",
  isFirstAdmin: false,
  requirePwdChange: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  profile: {
    publicId: "p-1",
    firstName: "Juan",
    lastName: "Pérez",
    fullName: "Juan Pérez",
    phone: "",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  role: ROLES[0],
  status: STATUSES[0],
  userUnits: [
    {
      publicId: "uu-1",
      isCurrentOccupant: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      userUnitRole: {
        publicId: "ur-1",
        name: "owner",
        displayName: "Propietario",
      },
      unit: {
        publicId: "unit-1",
        identifier: "D-101",
        createdAt: "2024-01-01T00:00:00.000Z",
        street: { publicId: "st-1", name: "Calle A" },
        type: {
          publicId: "ut-1",
          name: "dept",
          displayName: "Departamento",
        },
        userUnits: [],
      },
    },
  ],
};

const CREATE_UNIT: CreateUnit = {
  streetId: "st-1",
  unitIdentifier: "D-101",
  unitTypeId: "ut-1",
  unitRoleId: "ur-1",
  isCurrentOccupant: true,
};

describe("ResidentFormPage", () => {
  let fixture: ComponentFixture<ResidentFormPage>;
  let residentStoreStub: {
    loading: () => false;
    callState: () => undefined;
    loadById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  let router: Router;

  beforeEach(async () => {
    residentStoreStub = {
      loading: () => false,
      callState: () => undefined,
      loadById: jest.fn().mockResolvedValue(USER),
      create: jest.fn().mockResolvedValue(true),
      update: jest.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ResidentFormPage],
      providers: [
        provideRouter([{ path: "**", component: RouterStubComponent }]),
        {
          provide: CatalogsStore,
          useValue: {
            loaded: () => true,
            UserRoles: () => ROLES,
            UnitTypes: () => [],
            UserUnitRoles: () => [],
          } as unknown as typeof CatalogsStore,
        },
        {
          provide: ContextStore,
          useValue: {
            streets: () => [{ publicId: "st-1", name: "Calle A" }],
          } as unknown as typeof ContextStore,
        },
        {
          provide: UnitStore,
          useValue: {
            entities: () => [],
          } as unknown as typeof UnitStore,
        },
        {
          provide: ResidentStore,
          useValue: residentStoreStub as unknown as typeof ResidentStore,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  async function mount(id?: string): Promise<void> {
    fixture = TestBed.createComponent(ResidentFormPage);
    if (id) {
      fixture.componentRef.setInput("id", id);
    }
    await fixture.whenStable();
  }

  function page(): FormPageLike {
    return fixture.componentInstance as unknown as FormPageLike;
  }

  it("should create", async () => {
    await mount();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it("prefills the resident role in create mode", async () => {
    await mount();

    expect(page().form.controls.userRoleId.value).toBe("role-1");
  });

  it("keeps the email editable in create mode", async () => {
    await mount();

    expect(page().form.controls.email.disabled).toBe(false);
  });

  it("loads and patches the resident in update mode", async () => {
    await mount("usr-1");

    expect(residentStoreStub.loadById).toHaveBeenCalledWith("usr-1");
    expect(page().form.controls.email.value).toBe("resident@example.com");
    expect(page().form.controls.userRoleId.value).toBe("role-1");
    expect(page().form.controls.unit.value).toMatchObject({
      unitId: "unit-1",
      unitRoleId: "ur-1",
      isCurrentOccupant: true,
    });
  });

  it("disables the email in update mode", async () => {
    await mount("usr-1");

    expect(page().form.controls.email.disabled).toBe(true);
  });

  it("renders the read-only summary panel in update mode", async () => {
    await mount("usr-1");

    expect(fixture.nativeElement.textContent).toContain("Juan Pérez");
    expect(fixture.nativeElement.textContent).toContain(
      "resident@example.com",
    );
  });

  it("navigates back home when the resident is not found", async () => {
    residentStoreStub.loadById.mockResolvedValue(null);
    const navigateSpy = jest.spyOn(router, "navigateByUrl");

    await mount("missing");

    expect(navigateSpy).toHaveBeenCalledWith("/residents");
  });

  it("does not submit an invalid form", async () => {
    await mount();

    await page().submit();

    expect(residentStoreStub.create).not.toHaveBeenCalled();
  });

  it("submits the create payload and navigates home", async () => {
    await mount();

    page().form.controls.email.setValue("new-resident@example.com");
    page().form.controls.unit.setValue(CREATE_UNIT);

    await page().submit();

    expect(residentStoreStub.create).toHaveBeenCalledWith({
      email: "new-resident@example.com",
      userRoleId: "role-1",
      unit: CREATE_UNIT,
    });
  });

  it("sends only the role when it changed on update", async () => {
    await mount("usr-1");

    page().form.controls.userRoleId.setValue("role-2");

    await page().submit();

    expect(residentStoreStub.update).toHaveBeenCalledWith("usr-1", {
      userRoleId: "role-2",
    });
  });

  it("sends an empty payload when nothing changed on update", async () => {
    await mount("usr-1");

    await page().submit();

    expect(residentStoreStub.update).toHaveBeenCalledWith("usr-1", {});
  });

  it("sends the unit when the ownership changed on update", async () => {
    await mount("usr-1");

    page().form.controls.unit.setValue({
      unitId: "unit-1",
      unitRoleId: "ur-1",
      isCurrentOccupant: false,
    });

    await page().submit();

    expect(residentStoreStub.update).toHaveBeenCalledWith("usr-1", {
      unit: expect.objectContaining({
        unitId: "unit-1",
        isCurrentOccupant: false,
      }),
    });
  });

  it("navigates home after a successful submit", async () => {
    const navigateByUrlSpy = jest.spyOn(router, "navigateByUrl");
    await mount();

    page().form.controls.email.setValue("new-resident@example.com");
    page().form.controls.unit.setValue(CREATE_UNIT);

    await page().submit();

    expect(navigateByUrlSpy).toHaveBeenCalledWith("/residents");
  });

  it("stays on the page when the create fails", async () => {
    residentStoreStub.create.mockResolvedValue(false);
    const navigateByUrlSpy = jest.spyOn(router, "navigateByUrl");
    await mount();

    page().form.controls.email.setValue("new-resident@example.com");
    page().form.controls.unit.setValue(CREATE_UNIT);

    await page().submit();

    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it("cancels back to the home list", async () => {
    const navigateSpy = jest.spyOn(router, "navigate");
    await mount();

    page().cancel();

    expect(navigateSpy).toHaveBeenCalledWith(["/residents"]);
  });
});