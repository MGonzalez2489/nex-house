import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BaseCatalogModel } from "@nexhouse/shared-domain/models";
import { ResidentFilters } from "./resident-filters";

const ROLES: BaseCatalogModel[] = [
  { publicId: "role-1", name: "admin", displayName: "Administrador" },
  { publicId: "role-2", name: "resident", displayName: "Residente" },
];

const STATUSES: BaseCatalogModel[] = [
  { publicId: "s-1", name: "active", displayName: "Activo" },
  { publicId: "s-2", name: "inactive", displayName: "Inactivo" },
];

describe("ResidentFilters", () => {
  let component: ResidentFilters;
  let fixture: ComponentFixture<ResidentFilters>;
  let emitSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentFilters);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("roles", ROLES);
    fixture.componentRef.setInput("statuses", STATUSES);
    emitSpy = jest.spyOn(component.filter, "emit");
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not emit before any input", () => {
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("should debounce the global filter and emit with first: 0", async () => {
    jest.useFakeTimers();

    component.form.controls.globalFilter.setValue("juan");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledWith({
      first: 0,
      globalFilter: "juan",
      role: undefined,
      status: undefined,
    });
  });

  it("should not re-emit when the value is repeated", async () => {
    jest.useFakeTimers();

    component.form.controls.globalFilter.setValue("centro");
    jest.advanceTimersByTime(300);
    component.form.controls.globalFilter.setValue("centro");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it("should clear the global filter when the input is emptied", async () => {
    jest.useFakeTimers();

    component.form.controls.globalFilter.setValue("  ");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenLastCalledWith({
      first: 0,
      globalFilter: undefined,
      role: undefined,
      status: undefined,
    });
  });

  it("should emit the selected role using its name as value", async () => {
    jest.useFakeTimers();

    component.form.controls.role.setValue("resident");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenLastCalledWith({
      first: 0,
      globalFilter: undefined,
      role: "resident",
      status: undefined,
    });
  });

  it("should prevent the implicit form submit (Enter) and emit immediately", async () => {
    component.form.controls.globalFilter.setValue("juan");

    const form: HTMLFormElement = fixture.nativeElement.querySelector("form");
    const event = new SubmitEvent("submit", {
      cancelable: true,
      bubbles: true,
    });
    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(emitSpy).toHaveBeenLastCalledWith({
      first: 0,
      globalFilter: "juan",
      role: undefined,
      status: undefined,
    });
  });
});