import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { NeighborhoodService } from "@neighborhoods/services";
import { NeighborhoodsStore } from "@neighborhoods/neighborhood.store";
import { of, throwError } from "rxjs";
import { NeighHomePage } from "./neigh-home-page";

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  streets: [],
  address: undefined,
};

const PAGINATION_META = { total: 1, page: 1, lastPage: 1, limit: 10 };

describe("NeighHomePage", () => {
  let fixture: ComponentFixture<NeighHomePage>;
  let service: Partial<NeighborhoodService>;

  beforeEach(async () => {
    service = {
      getAll: jest.fn().mockReturnValue(
        of({
          data: [NEIGHBORHOOD],
          message: "ok",
          meta: PAGINATION_META,
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [NeighHomePage],
      providers: [
        provideRouter([]),
        { provide: NeighborhoodService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighHomePage);
    await fixture.whenStable();
  });

  it("should render the loaded neighborhoods from the store", () => {
    expect(fixture.nativeElement.textContent).toContain("La Hacienda");
  });

  it("should render the page header with the title, subtitle and projected actions", () => {
    const header = fixture.nativeElement.querySelector("app-page-header");
    expect(header).toBeTruthy();
    expect(header.querySelector("h1").textContent.trim()).toBe("Fraccionamientos");
    expect(header.querySelector("p").textContent).toContain(
      "Busca, filtra y administra los fraccionamientos",
    );

    // actions are projected as content, not declared by app-page-header
    const actions = header.querySelector("header > div:last-child");
    expect(actions.textContent).toContain("Nuevo");
    expect(actions.querySelectorAll("p-button").length).toBe(2);
  });

  it("should keep the title and the projected actions on opposite sides of the header row", () => {
    const headerClasses =
      fixture.nativeElement.querySelector("app-page-header header").className;
    expect(headerClasses).toContain("justify-between");
    expect(headerClasses).toContain("items-center");
  });

  it("should render the error feedback when the load fails", async () => {
    (service.getAll as jest.Mock).mockReturnValue(
      throwError(() => new Error("boom")),
    );

    fixture = TestBed.createComponent(NeighHomePage);
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector("app-form-feedback"),
    ).toBeTruthy();
  });

  describe("mobile filter sheet", () => {
    const panel = () => document.body.querySelector(".p-drawer");
    const asHtml = (nodes: NodeListOf<Element>) => Array.from(nodes) as HTMLElement[];
    const searchButton = () =>
      asHtml(fixture.nativeElement.querySelectorAll("p-button")).find((el) =>
        el.querySelector(".pi-search"),
      ) as HTMLElement;
    const filterBadge = () =>
      fixture.nativeElement.querySelector("span.relative p-badge .p-badge") as HTMLElement | null;
    const sheetButton = (label: string) =>
      asHtml(panel()?.querySelectorAll("p-button") ?? document.querySelectorAll("none")).find(
        (el) => el.textContent.includes(label),
      ) as HTMLElement;
    const sheetInput = () => panel()?.querySelector("input[aria-label]") as HTMLInputElement;

    it("should not render the sheet until the header trigger is used", () => {
      expect(panel()).toBeNull();
    });

    it("should not badge the trigger while no filter is applied", () => {
      expect(filterBadge()).toBeNull();
    });

    it("should badge the trigger with the number of applied filters", async () => {
      fixture.componentInstance["onSearch"]({ globalFilter: "centro" });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(filterBadge()?.textContent).toContain("1");
    });

    it("should report the filter count in the trigger's accessible name", async () => {
      expect(
        searchButton().querySelector("button")?.getAttribute("aria-label"),
      ).toBe("Filtrar fraccionamientos");

      fixture.componentInstance["onSearch"]({ globalFilter: "centro" });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        searchButton().querySelector("button")?.getAttribute("aria-label"),
      ).toBe("Filtrar fraccionamientos (1 filtro aplicado)");
    });

    it("should pluralise the accessible name for more than one filter", async () => {
      fixture.componentInstance["onSearch"]({
        globalFilter: "centro",
        isActive: true,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        searchButton().querySelector("button")?.getAttribute("aria-label"),
      ).toBe("Filtrar fraccionamientos (2 filtros aplicados)");
    });

    it("should not count paging keys as applied filters", async () => {
      fixture.componentInstance["onSearch"]({ first: 0, rows: 10 });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(filterBadge()).toBeNull();
    });

    it("should clear the badge when the filters are emptied", async () => {
      fixture.componentInstance["onSearch"]({ globalFilter: "centro" });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(filterBadge()).toBeTruthy();

      fixture.componentInstance["onSearch"]({});
      fixture.detectChanges();
      await fixture.whenStable();

      expect(filterBadge()).toBeNull();
    });

    it("should open the sheet from the mobile search button", async () => {
      expect(searchButton()).toBeTruthy();

      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(panel()).toBeTruthy();
      expect(panel()?.querySelector(".p-drawer-header")?.textContent).toContain(
        "Filtros",
      );
    });

    it("should not navigate to create when opening the filters", () => {
      const navigate = jest.fn();
      TestBed.inject(Router).navigate = navigate;

      searchButton().click();
      fixture.detectChanges();

      expect(navigate).not.toHaveBeenCalled();
    });

    it("should not reload the list while the draft is being edited", async () => {
      const loadAll = jest.spyOn(
        TestBed.inject(NeighborhoodsStore) as unknown as {
          loadAll: (f?: SearchNeigh) => void;
        },
        "loadAll",
      );
      loadAll.mockClear();

      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      const input = sheetInput();
      input.value = "centro";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      expect(loadAll).not.toHaveBeenCalled();
    });

    it("should reload with the draft only after applying", async () => {
      const store = TestBed.inject(NeighborhoodsStore);
      const loadAll = jest.spyOn(store, "loadAll");
      loadAll.mockClear();

      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      const input = sheetInput();
      input.value = "centro";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      sheetButton("Aplicar").click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(loadAll).toHaveBeenCalledWith({ globalFilter: "centro" });
    });

    it("should keep Aplicar disabled while the draft matches the applied filters", async () => {
      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      // p-button hosts the real <button> one level down
      expect(
        (sheetButton("Aplicar").querySelector("button") as HTMLButtonElement).disabled,
      ).toBe(true);
    });

    it("should clear the draft without closing the sheet", async () => {
      const loadAll = jest.spyOn(TestBed.inject(NeighborhoodsStore), "loadAll");
      loadAll.mockClear();

      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      const input = sheetInput();
      input.value = "centro";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      sheetButton("Limpiar").click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        sheetInput().value,
      ).toBe("");
      expect(panel()).toBeTruthy();
      expect(loadAll).not.toHaveBeenCalled();
    });

    it("should discard the draft when the sheet is dismissed", async () => {
      const loadAll = jest.spyOn(TestBed.inject(NeighborhoodsStore), "loadAll");
      loadAll.mockClear();

      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      const input = sheetInput();
      input.value = "centro";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      // p-drawer listens for the legacy `which == 27`, which synthetic events never set
      const escape = new KeyboardEvent("keydown", { key: "Escape" });
      Object.defineProperty(escape, "which", { value: 27 });
      document.dispatchEvent(escape);
      fixture.detectChanges();
      await fixture.whenStable();

      // reopening seeds the draft from the applied filters, not from the discarded edit
      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        sheetInput().value,
      ).toBe("");
      expect(loadAll).not.toHaveBeenCalled();
    });

    it("should seed the sheet with the filters applied from the desktop table", async () => {
      const store = TestBed.inject(NeighborhoodsStore);
      jest.spyOn(store, "loadAll");

      fixture.componentInstance["onSearch"]({ globalFilter: "centro" });
      fixture.detectChanges();
      await fixture.whenStable();

      searchButton().click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        sheetInput().value,
      ).toBe("centro");
    });
  });
});