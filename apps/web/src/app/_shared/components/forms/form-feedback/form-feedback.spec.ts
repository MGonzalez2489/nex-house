import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormFeedback } from "./form-feedback";

describe("FormFeedback", () => {
  let component: FormFeedback;
  let fixture: ComponentFixture<FormFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFeedback],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFeedback);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
