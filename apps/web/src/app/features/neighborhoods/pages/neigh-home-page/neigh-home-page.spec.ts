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

  it("should show the register count badge from the pagination meta", () => {
    expect(fixture.nativeElement.textContent).toContain(
      "1 registrados · 1 activos",
    );
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