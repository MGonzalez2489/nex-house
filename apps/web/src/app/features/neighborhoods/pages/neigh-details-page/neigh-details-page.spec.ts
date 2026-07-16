import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighDetailsPage } from "./neigh-details-page";

describe("NeighDetailsPage", () => {
  let component: NeighDetailsPage;
  let fixture: ComponentFixture<NeighDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
