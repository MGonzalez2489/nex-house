import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchNeigh } from "@nexhouse/shared-domain/interfaces";
import { NeighTableFilters } from "./neigh-table-filters";

@Component({
  standalone: true,
  imports: [NeighTableFilters],
  template: `
    <app-neigh-table-filters
      [value]="value()"
      [debounceMs]="debounceMs()"
      (filter)="onFilter($event)"
    />
  `,
})
class HostComponent {
  readonly value = signal<SearchNeigh>({});
  readonly debounceMs = signal(300);
  readonly emitted = signal<SearchNeigh[]>([]);

  onFilter(value: SearchNeigh): void {
    this.emitted.update((list) => [...list, value]);
  }
}

describe("NeighTableFilters", () => {
  let component: NeighTableFilters;
  let fixture: ComponentFixture<NeighTableFilters>;
  let emitSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighTableFilters, HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NeighTableFilters);
    component = fixture.componentInstance;
    // bracket access: the output is protected for template consumers
    emitSpy = jest.spyOn(component["filter"], "emit");
    await fixture.whenStable();
  });

  const hostInput = (hostFixture: ComponentFixture<HostComponent>) =>
    hostFixture.nativeElement.querySelector("input[aria-label]") as HTMLInputElement;

  const buildHost = async (host?: { value?: SearchNeigh; debounceMs?: number }) => {
    const hostFixture = TestBed.createComponent(HostComponent);
    if (host?.value !== undefined) {
      hostFixture.componentInstance.value.set(host.value);
    }
    if (host?.debounceMs !== undefined) {
      hostFixture.componentInstance.debounceMs.set(host.debounceMs);
    }
    await hostFixture.whenStable();
    return hostFixture;
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should not emit before any input", () => {
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("should debounce the hint and emit a globalFilter", async () => {
    jest.useFakeTimers();

    component["form"].controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledWith({ globalFilter: "centro" });
  });

  it("should not re-emit when the hint value is repeated", async () => {
    jest.useFakeTimers();

    component["form"].controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    component["form"].controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it("should clear globalFilter when the hint is emptied", async () => {
    jest.useFakeTimers();

    component["form"].controls.hint.setValue("centro");
    jest.advanceTimersByTime(300);
    component["form"].controls.hint.setValue("");
    jest.advanceTimersByTime(300);
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenLastCalledWith({ globalFilter: undefined });
  });

  it("should prevent the implicit form submit (Enter)", () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector("form");
    const event = new SubmitEvent("submit", { cancelable: true, bubbles: true });

    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("should have no responsive breakpoint assumptions in its own template", () => {
    const host = (fixture.nativeElement as HTMLElement).innerHTML;
    expect(host).not.toContain("md:");
  });

  it("should reflect an external value into the form", async () => {
    const hostFixture = await buildHost({ value: { globalFilter: "centro" } });

    const input = hostInput(hostFixture);

    expect(input.value).toBe("centro");
  });

  it("should clear the form when the external value is reset", async () => {
    const hostFixture = await buildHost({ value: { globalFilter: "centro" } });
    jest.useFakeTimers();

    hostFixture.componentInstance.value.set({});
    jest.advanceTimersByTime(300);
    hostFixture.detectChanges();

    const input = hostInput(hostFixture);

    expect(input.value).toBe("");
  });

  it("should not write the value back to the parent", async () => {
    const hostFixture = await buildHost();
    jest.useFakeTimers();

    const input = hostInput(hostFixture);

    input.value = "centro";
    input.dispatchEvent(new Event("input"));
    jest.advanceTimersByTime(300);
    hostFixture.detectChanges();

    // the form edited itself, the parent state was never mutated by the child
    expect(hostFixture.componentInstance.value()).toEqual({});
    expect(hostFixture.componentInstance.emitted()).toEqual([
      { globalFilter: "centro" },
    ]);
  });

  it("should emit synchronously when debounceMs is 0", async () => {
    const hostFixture = await buildHost({ debounceMs: 0 });

    const input = hostInput(hostFixture);

    input.value = "centro";
    input.dispatchEvent(new Event("input"));
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.emitted()).toEqual([
      { globalFilter: "centro" },
    ]);
  });

  it("should follow debounceMs changes after initialization", async () => {
    const hostFixture = await buildHost({ debounceMs: 300 });
    jest.useFakeTimers();

    hostFixture.componentInstance.debounceMs.set(0);
    hostFixture.detectChanges();

    const input = hostInput(hostFixture);

    input.value = "centro";
    input.dispatchEvent(new Event("input"));
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.emitted()).toEqual([
      { globalFilter: "centro" },
    ]);
  });

  it("should not re-emit when the parent re-sends the same value", async () => {
    const hostFixture = await buildHost({ value: { globalFilter: "centro" } });
    jest.useFakeTimers();

    hostFixture.componentInstance.value.set({ globalFilter: "centro" });
    jest.advanceTimersByTime(300);
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.emitted()).toEqual([]);
  });
});