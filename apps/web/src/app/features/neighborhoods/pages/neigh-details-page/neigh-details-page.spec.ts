import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { NeighborhoodModel } from "@nexhouse/shared-domain/models";
import { NeighborhoodService } from "@neighborhoods/services";
import { of } from "rxjs";
import { NeighDetailsPage } from "./neigh-details-page";

const NEIGHBORHOOD: NeighborhoodModel = {
  publicId: "nb-1",
  name: "La Hacienda",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streets: [
    { publicId: "st-1", name: "Calle A", createdAt: "", updatedAt: "" },
  ],
  address: undefined,
};

describe("NeighDetailsPage", () => {
  let component: NeighDetailsPage;
  let fixture: ComponentFixture<NeighDetailsPage>;
  let router: Router;

  beforeEach(async () => {
    router = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [NeighDetailsPage],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: NeighborhoodService,
          useValue: {
            getById: jest.fn().mockReturnValue(of({ data: NEIGHBORHOOD, message: "ok" })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighDetailsPage);
    component = fixture.componentInstance;
  });

  it("should fetch and render the neighborhood by id", async () => {
    fixture.componentRef.setInput("id", "nb-1");
    await fixture.whenStable();

    expect(component.neighborhood()?.name).toBe("La Hacienda");
    expect(fixture.nativeElement.textContent).toContain("Calle A");
  });

  it("back() navigates to the home route", () => {
    component.back();

    expect(router.navigate).toHaveBeenCalledWith(["neighborhoods"]);
  });

  it("edit() navigates to the edit route with the neighborhood id", () => {
    component.neighborhood.set(NEIGHBORHOOD);

    component.edit();

    expect(router.navigate).toHaveBeenCalledWith([
      "neighborhoods",
      "nb-1",
      "edit",
    ]);
  });
});