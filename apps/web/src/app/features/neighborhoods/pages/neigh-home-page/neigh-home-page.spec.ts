import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { NeighborhoodService } from "@neighborhoods/services";
import { of, throwError } from "rxjs";
import { NeighHomePage } from "./neigh-home-page";

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
    expect(headerClasses).toContain("items-start");
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
});