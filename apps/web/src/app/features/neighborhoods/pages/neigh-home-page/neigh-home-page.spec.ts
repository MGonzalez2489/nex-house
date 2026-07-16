import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighHomePage } from "./neigh-home-page";

describe("NeighHomePage", () => {
  let component: NeighHomePage;
  let fixture: ComponentFixture<NeighHomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighHomePage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighHomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
