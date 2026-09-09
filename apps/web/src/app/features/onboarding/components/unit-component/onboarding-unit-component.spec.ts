import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BaseCatalogModel, NeighStreetModel } from "@nexhouse/shared-domain/models";
import { OnboardingUnitComponent } from "./onboarding-unit-component";

@Component({
  standalone: true,
  imports: [OnboardingUnitComponent],
  template: `
    <app-onboarding-unit-component
      [streets]="streets()"
      [unitTypes]="unitTypes()"
      [unitRoles]="unitRoles()"
    />
  `,
})
class TestHostComponent {
  readonly streets = signal<NeighStreetModel[]>([
    { publicId: "s1", name: "Calle Reforma" } as NeighStreetModel,
  ]);
  readonly unitTypes = signal<BaseCatalogModel[]>([
    { publicId: "ut1", name: "casa", displayName: "Casa" },
  ]);
  readonly unitRoles = signal<BaseCatalogModel[]>([
    { publicId: "ur1", name: "owner", displayName: "Propietario" },
  ]);
}

describe("OnboardingUnitComponent", () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(hostComponent).toBeTruthy();
  });
});