import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { signal, WritableSignal } from "@angular/core";
import { App } from "./app";
import { StartupStore } from "@stores/startup.store";

describe("App", () => {
  let fixture: ComponentFixture<App>;
  let status: WritableSignal<string>;

  function splash(): Element | null {
    return (fixture.nativeElement as HTMLElement).querySelector(".fixed.inset-0");
  }

  beforeEach(async () => {
    status = signal("IDLE");
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: StartupStore, useValue: { status } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it("does not render the boot splash while idle", () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain("Iniciando Experiencia");
    expect(el.textContent).not.toContain("Preparando NexHouse");
  });

  it("renders the boot splash while loading", () => {
    status.set("LOADING");
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "Iniciando Experiencia",
    );
  });

  it("keeps the splash opaque until the destination route renders", () => {
    status.set("READY");
    fixture.detectChanges();

    expect(splash()).toBeTruthy();
    expect(splash()?.classList.contains("opacity-0")).toBe(false);
    expect(splash()?.textContent).toContain("Preparando NexHouse");
  });

  it("fades the splash once ready and the route is rendered", () => {
    status.set("READY");
    fixture.detectChanges();

    (fixture.componentInstance as unknown as { isRouteLoaded: { set: (v: boolean) => void } }).isRouteLoaded.set(
      true,
    );
    fixture.detectChanges();

    expect(splash()?.classList.contains("opacity-0")).toBe(true);
  });
});