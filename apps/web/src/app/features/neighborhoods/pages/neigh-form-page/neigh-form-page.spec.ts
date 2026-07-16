import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighFormPage } from "./neigh-form-page";

describe("NeighFormPage", () => {
  let component: NeighFormPage;
  let fixture: ComponentFixture<NeighFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighFormPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
