import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResidentLayout } from "./resident-layout";

describe("ResidentLayout", () => {
  let component: ResidentLayout;
  let fixture: ComponentFixture<ResidentLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
