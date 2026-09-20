import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NeighTableFilters } from "./neigh-table-filters";

describe("NeighTableFilters", () => {
  let component: NeighTableFilters;
  let fixture: ComponentFixture<NeighTableFilters>;
  let emitSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighTableFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighTableFilters);
    component = fixture.componentInstance;
    emitSpy = jest.spyOn(component.filter, "emit");
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not emit before any input", () => {
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("should debounce the hint and emit a globalFilter", async () => {
    jest.useFakeTimers();

    component.form.controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledWith({ globalFilter: "centro" });
  });

  it("should not re-emit when the hint value is repeated", async () => {
    jest.useFakeTimers();

    component.form.controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    component.form.controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it("should clear globalFilter when the hint is emptied", async () => {
    jest.useFakeTimers();

    component.form.controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    component.form.controls.hint.setValue("");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenLastCalledWith({ globalFilter: undefined });
  });

  it("should prevent the implicit form submit (Enter)", () => {
    const form: HTMLFormElement =
      fixture.nativeElement.querySelector("form");
    const event = new SubmitEvent("submit", { cancelable: true, bubbles: true });

    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});