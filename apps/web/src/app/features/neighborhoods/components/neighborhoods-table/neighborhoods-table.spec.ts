import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { NeighborhoodsTable } from "./neighborhoods-table";

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streets: [
    { publicId: "st-1", name: "Calle A", createdAt: "", updatedAt: "" },
    { publicId: "st-2", name: "Calle B", createdAt: "", updatedAt: "" },
  ],
  address: undefined,
};

describe("NeighborhoodsTable", () => {
  let component: NeighborhoodsTable;
  let fixture: ComponentFixture<NeighborhoodsTable>;
  let paginateSpy: jest.SpyInstance;
  let viewSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodsTable],
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
  });

  it("should render the desktop table with the neighborhood name", () => {
    expect(fixture.nativeElement.textContent).toContain("La Hacienda");
    expect(fixture.nativeElement.querySelector("p-table")).toBeTruthy();
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
    fixture.componentRef.setInput("isMobile", true);
    await fixture.whenStable();

    const card = Array.from(
      fixture.nativeElement.querySelectorAll("button"),
    ).find((el: HTMLElement) => el.textContent.includes("2 calles"));

    expect(card).toBeDefined();
    (card as HTMLElement).click();
    expect(viewSpy).toHaveBeenCalledWith("nb-1");
  });

  it("shows the empty-state message when there are no items", async () => {
    fixture.componentRef.setInput("items", []);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain(
      "No se encontraron fraccionamientos",
    );
  });
});