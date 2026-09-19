import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, Validators} from '@angular/forms';
import {AuthEmailField} from './auth-email-field';

describe('AuthEmailField', () => {
  let fixture: ComponentFixture<AuthEmailField>;
  let component: AuthEmailField;
  let control: FormControl<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [AuthEmailField]}).compileComponents();

    control = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    });

    fixture = TestBed.createComponent(AuthEmailField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders an email input with the email autocomplete hint', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input).not.toBeNull();
    expect(input.type).toBe('email');
    expect(input.id).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('links the input to the rendered error element when invalid and touched', () => {
    control.markAsTouched();
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('email-errors');
    expect(fixture.nativeElement.querySelector('#email-errors')).not.toBeNull();
  });

  it('does not describe errors while the control is untouched', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('aria-describedby')).toBeNull();
  });
});
