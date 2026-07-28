import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighStatusTag } from "./neigh-status-tag";

describe("NeighStatusTag", () => {
  let component: NeighStatusTag;
  let fixture: ComponentFixture<NeighStatusTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighStatusTag],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighStatusTag);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
