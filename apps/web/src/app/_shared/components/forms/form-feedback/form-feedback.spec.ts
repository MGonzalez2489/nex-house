import { CallState } from "@ngrx-toolkit/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormFeedback } from "./form-feedback";

const CALL_STATE: CallState = { error: "No se pudo completar la operación" };

describe("FormFeedback", () => {
  let component: FormFeedback;
  let fixture: ComponentFixture<FormFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFeedback],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFeedback);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("callState", CALL_STATE);
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
