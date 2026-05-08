import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private readonly fb = inject(FormBuilder);

  loading = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    role: ['candidate', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    companyName: ['']
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  get isEmployer(): boolean {
    return this.form.controls.role.value === 'employer';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.loading = true;
    this.error = '';

    this.auth.register({
      name: value.name,
      email: value.email,
      password: value.password,
      role: value.role as 'candidate' | 'employer',
      companyName: value.companyName
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ user }) => this.router.navigate([this.auth.redirectPathForRole(user.role)]),
        error: (error) => {
          this.error = getApiErrorMessage(error);
        }
      });
  }
}
