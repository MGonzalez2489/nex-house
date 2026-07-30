import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ResudentStatusComponent } from "./resudent-status-component";

describe("ResudentStatusComponent", () => {
  let component: ResudentStatusComponent;
  let fixture: ComponentFixture<ResudentStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResudentStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResudentStatusComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
