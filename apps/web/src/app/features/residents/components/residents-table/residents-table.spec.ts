import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UserRoleEnum, UserStatusEnum } from "@nexhouse/shared-domain/enums";
import { BaseCatalogModel, UserModel } from "@nexhouse/shared-domain/models";
import { ResidentsTable } from "./residents-table";

const ROLES: BaseCatalogModel[] = [
  { publicId: "role-1", name: UserRoleEnum.RESIDENT, displayName: "Residente" },
  { publicId: "role-2", name: "admin", displayName: "Administrador" },
];

const STATUSES: BaseCatalogModel[] = [
  { publicId: "s-1", name: UserStatusEnum.ACTIVE, displayName: "Activo" },
  { publicId: "s-2", name: UserStatusEnum.INACTIVE, displayName: "Inactivo" },
];

const PAGINATION = { total: 1, page: 1, lastPage: 1, limit: 10 };

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
  role: ROLES[0],
  status: STATUSES[0],
  userUnits: [],
};

describe("ResidentsTable", () => {
  let component: ResidentsTable;
  let fixture: ComponentFixture<ResidentsTable>;
  let paginateSpy: jest.SpyInstance;
  let viewSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentsTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("items", [USER]);
    fixture.componentRef.setInput("pagination", PAGINATION);
    fixture.componentRef.setInput("roles", ROLES);
    fixture.componentRef.setInput("statuses", STATUSES);
    paginateSpy = jest.spyOn(component.paginate, "emit");
    viewSpy = jest.spyOn(component.view, "emit");
    await fixture.whenStable();
  });

  it("renders the desktop table with the resident email", () => {
    expect(fixture.nativeElement.querySelector("p-table")).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      "resident@example.com",
    );
  });

  it("marks header cells with scope=col", () => {
    const headers = fixture.nativeElement.querySelectorAll("p-table th");
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach((th: HTMLElement) => {
      expect(th.getAttribute("scope")).toBe("col");
    });
  });

  it("re-emits a pagination request from the lazy table search", () => {
    component.search({ first: 10, rows: 10 });

    expect(paginateSpy).toHaveBeenCalledWith({ first: 10, rows: 10 });
  });

  it("re-emits a pagination request from the mobile paginator", () => {
    component.paginateMobile({ first: 20, rows: 20 });

    expect(paginateSpy).toHaveBeenCalledWith({ first: 20, rows: 20 });
  });

  it("forwards filter changes merged into the pagination request", () => {
    component.filter({ first: 0, globalFilter: "juan", role: "resident" });

    expect(paginateSpy).toHaveBeenCalledWith({
      first: 0,
      globalFilter: "juan",
      role: "resident",
    });
  });

  it("emits view on the desktop detail button", () => {
    const detailButton = fixture.nativeElement.querySelector(
      '[aria-label*="Ver detalle de"]',
    );

    expect(detailButton).toBeTruthy();
    (detailButton as HTMLElement).click();
    expect(viewSpy).toHaveBeenCalledWith("usr-1");
  });

  it("renders tappable cards on mobile and emits view on tap", async () => {
    fixture.componentRef.setInput("isMobile", true);
    await fixture.whenStable();

    const card = Array.from(
      fixture.nativeElement.querySelectorAll("button"),
    ).find((el: HTMLElement) => el.textContent.includes("Juan Pérez"));

    expect(card).toBeDefined();
    (card as HTMLElement).click();
    expect(viewSpy).toHaveBeenCalledWith("usr-1");
  });

  it("shows the empty-state message when there are no items", async () => {
    fixture.componentRef.setInput("items", []);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      "No se encontraron residentes",
    );
  });

  it("exposes the filtered roles/statuses to the embedded filters", () => {
    expect(component.roles()).toEqual(ROLES);
    expect(component.statuses()).toEqual(STATUSES);
  });
});