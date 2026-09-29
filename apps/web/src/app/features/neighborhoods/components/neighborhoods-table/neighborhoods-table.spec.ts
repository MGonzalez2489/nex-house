import { signal, WritableSignal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { SessionService } from "@core/services";
import { NeighborhoodsTable } from "./neighborhoods-table";

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  streets: [
    { publicId: "st-1", name: "Calle A", createdAt: "" },
    { publicId: "st-2", name: "Calle B", createdAt: "" },
  ],
  address: undefined,
};

describe("NeighborhoodsTable", () => {
  let component: NeighborhoodsTable;
  let fixture: ComponentFixture<NeighborhoodsTable>;
  let paginateSpy: jest.SpyInstance;
  let viewSpy: jest.SpyInstance;
  let isMobile: WritableSignal<boolean>;

  const buttons = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll("button"),
    ) as HTMLElement[];

  const build = async (mobile = false) => {
    isMobile = signal(mobile);
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsTable],
      providers: [{ provide: SessionService, useValue: { isMobile } }],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighborhoodsTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("items", [NEIGHBORHOOD]);
    fixture.componentRef.setInput("pagination", {
      total: 1,
      page: 1,
      lastPage: 1,
      limit: 10,
    });
    paginateSpy = jest.spyOn(component.paginate, "emit");
    viewSpy = jest.spyOn(component.view, "emit");
    await fixture.whenStable();
    return fixture;
  };

  beforeEach(async () => {
    await build(false);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the desktop table with the neighborhood name", () => {
    expect(fixture.nativeElement.textContent).toContain("La Hacienda");
    expect(fixture.nativeElement.querySelector("p-table")).toBeTruthy();
  });

  it("renders the report title inside the card header, not the body", () => {
    const header = fixture.nativeElement.querySelector(".p-panel-header");
    const content = fixture.nativeElement.querySelector(".p-panel-content");

    // itemsReport(): "Mostrando registros del 1 al 1 de 1"
    expect(header.textContent).toContain("Mostrando registros del 1 al 1 de 1");
    expect(content.textContent).not.toContain("Mostrando registros del");
    // the table keeps its own, distinct paginator report inside the body
    expect(content.textContent).toContain("Pagina 1 de 1");
  });

  it("renders the filters in the card header, not the body", () => {
    const header = fixture.nativeElement.querySelector(".p-panel-header");
    const content = fixture.nativeElement.querySelector(".p-panel-content");

    expect(header.querySelector("app-neigh-table-filters")).toBeTruthy();
    expect(content.querySelector("app-neigh-table-filters")).toBeNull();
  });

  it("does not expose isMobile as an input anymore", () => {
    expect(
      Object.keys(fixture.componentRef.componentType.prototype),
    ).not.toContain("isMobile");
  });

  it("seeds the inline filters from the applied filter state", async () => {
    fixture.componentRef.setInput("filters", { globalFilter: "centro" });
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      "app-neigh-table-filters input[aria-label]",
    ) as HTMLInputElement;

    expect(input.value).toBe("centro");
  });

  it("keeps the filters out of the card on mobile", async () => {
    isMobile.set(true);
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector("app-neigh-table-filters"),
    ).toBeNull();
  });

  it("should mark header cells with scope=col", () => {
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

  it("renders tappable cards on mobile and emits view on tap", async () => {
    isMobile.set(true);
    await fixture.whenStable();

    const card = buttons().find((el) => el.textContent.includes("2 calles"));

    expect(card).toBeDefined();
    card?.click();
    expect(viewSpy).toHaveBeenCalledWith("nb-1");
  });

  it("switches back to the desktop layout when the viewport grows", async () => {
    isMobile.set(true);
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector("app-neigh-table-filters"),
    ).toBeNull();

    isMobile.set(false);
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector("app-neigh-table-filters"),
    ).toBeTruthy();
  });

  it("shows the empty-state message when there are no items", async () => {
    fixture.componentRef.setInput("items", []);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      "No se encontraron fraccionamientos",
    );
  });
});