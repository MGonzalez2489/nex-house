import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AUTH_ROUTES_ENUM} from '@auth/auth.routes';
import {AuthStore} from '@auth/store';
import {InputTextModule} from '@openng/optimus-ui/inputtext';
import {FormOptions, FormValidationErrorComponent} from '@shared/components/forms';

@Component({
  selector: 'app-pass-code-validate-page',
  imports: [InputTextModule, FormOptions, ReactiveFormsModule, FormValidationErrorComponent],
  templateUrl: './pass-code-validate-page.html',
  styleUrl: './pass-code-validate-page.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassCodeValidatePage implements OnInit {
  private readonly router = inject(Router);
  protected store = inject(AuthStore);
  readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    this.form.patchValue({code: this.store.recoveryCode()});
  }
  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const {code} = this.form.value;
    if (!code) return;

    const response = await this.store.codeValidation(code);
    if (response) {
      this.router.navigateByUrl(`/auth/${AUTH_ROUTES_ENUM.PASS_RECOVERY}`);
    }
  }
}
