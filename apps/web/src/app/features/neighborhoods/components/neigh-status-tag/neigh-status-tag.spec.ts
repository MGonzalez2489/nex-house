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
  });

  it("should render Activo + success severity for an active neighborhood", async () => {
    fixture.componentRef.setInput("isActive", true);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("Activo");
    expect(component.severity()).toBe("success");
  });

  it("should render Inactivo + warn severity for an inactive neighborhood", async () => {
    fixture.componentRef.setInput("isActive", false);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("Inactivo");
    expect(component.severity()).toBe("warn");
  });
});