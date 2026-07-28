import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ValidationErrors } from "@angular/forms";
import { FormValidationErrorComponent } from "./form-validation-error";

@Component({
  standalone: true,
  imports: [FormValidationErrorComponent],
  template: `
    <app-form-validation-error
      [errors]="errors()"
      [touched]="touched()"
      [label]="label()"
    />
  `,
})
class TestHostComponent {
  readonly errors = signal<ValidationErrors | null>(null);
  readonly touched = signal<boolean>(false);
  readonly label = signal<string>("Email");
}

describe("FormValidationErrorComponent", () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let errorElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormValidationErrorComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    errorElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should not display any error text on initialization when values are clean", () => {
    const errorContainers = errorElement.querySelectorAll("small");
    expect(errorContainers.length).toBe(0);
  });

  it("should not display errors even if validation fails but the control is untouched", () => {
    hostComponent.errors.set({ required: true });
    hostComponent.touched.set(false);
    fixture.detectChanges();

    const errorContainers = errorElement.querySelectorAll("small");
    expect(errorContainers.length).toBe(0);
  });

  it("should display error when control is touched and holds validation errors", () => {
    hostComponent.errors.set({ required: true });
    hostComponent.touched.set(true);
    fixture.detectChanges();

    const errorContainers = errorElement.querySelectorAll("small");
    expect(errorContainers.length).toBe(1);
    expect(errorContainers[0].textContent?.trim()).toBe("Email is required.");
  });

  it("should format message with dynamic limit constraints (minlength)", () => {
    hostComponent.label.set("Password");
    hostComponent.errors.set({ minlength: { requiredLength: 8 } });
    hostComponent.touched.set(true);
    fixture.detectChanges();

    const errorContainers = errorElement.querySelectorAll("small");
    expect(errorContainers.length).toBe(1);
    expect(errorContainers[0].textContent?.trim()).toBe(
      "Password must be at least 8 characters.",
    );
  });

  it("should fallback gracefully to standard text on unmapped error catalog keys", () => {
    hostComponent.label.set("Username");
    hostComponent.errors.set({ databaseCheckFailed: true });
    hostComponent.touched.set(true);
    fixture.detectChanges();

    const errorContainers = errorElement.querySelectorAll("small");
    expect(errorContainers.length).toBe(1);
    expect(errorContainers[0].textContent?.trim()).toBe(
      "Username: Invalid field (databaseCheckFailed)",
    );
  });

  it("should list multiple error records concurrently when multiple validations fail", () => {
    hostComponent.label.set("Profile URL");
    hostComponent.errors.set({ required: true, pattern: true });
    hostComponent.touched.set(true);
    fixture.detectChanges();

    const errorContainers = errorElement.querySelectorAll("small");
    expect(errorContainers.length).toBe(2);
    expect(errorContainers[0].textContent?.trim()).toBe(
      "Profile URL is required.",
    );
    expect(errorContainers[1].textContent?.trim()).toBe(
      "Profile URL format is invalid.",
    );
  });
});
