import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Input } from '@/app/shared/components/input/input';
import { Button } from '@/app/shared/components/button/button';
import { UserRegister } from '@/app/core/models/user.models';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, Input, Button],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private readonly api = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  serverErrorMessage = signal<string | null>(null);
  passwordStrength = signal({ width: '1%', color: '#d73f40' });
  showFirstNameError = signal(false);
  showLastNameError = signal(false);

  registerForm = this.fb.group(
    {
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      user_password: ['', Validators.required],
      user_password_confirm: ['', Validators.required],
    },
    { validators: this.passwordValidator.bind(this) },
  );

  constructor() {
    this.registerForm.get('user_password')?.valueChanges.subscribe((value) => {
      this.updatePasswordStrength(value || '');
    });

    this.registerForm.get('first_name')?.valueChanges.subscribe((value) => {
      this.filterNameInput('first_name', value || '');

      if (value && value.length >= 2) {
        this.showFirstNameError.set(false);
      } else {
        this.showFirstNameError.set(true);
      }
    });

    this.registerForm.get('last_name')?.valueChanges.subscribe((value) => {
      this.filterNameInput('last_name', value || '');

      if (value && value.length >= 2) {
        this.showLastNameError.set(false);
      } else {
        this.showLastNameError.set(true);
      }
    });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('user_password')?.value;
    const confirmPassword = control.get('user_password_confirm')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }

    const tests = [/\d/, /[a-z]/, /[A-Z]/, /\W/, /.{8,}/];
    const score = tests.filter((t) => t.test(password || '')).length;
    if (password && score < 5) {
      return { weak: true };
    }

    return null;
  }

  updatePasswordStrength(value: string) {
    const widthPower = ['1%', '20%', '40%', '60%', '80%', '100%'];
    const colorPower = ['#ff0000', '#b47144', '#f2b84f', '#ffe650', '#bde952', '#3ba62f'];
    const tests = [/\d/, /[a-z]/, /[A-Z]/, /\W/, /.{8,}/];
    const score = tests.filter((t) => t.test(value)).length;

    this.passwordStrength.set({
      width: widthPower[score],
      color: colorPower[score],
    });
  }

  private filterNameInput(fieldName: string, value: string) {
    const control = this.registerForm.get(fieldName);
    const filteredValue = value.replaceAll(/[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]/g, '');

    if (filteredValue !== value) {
      control?.setValue(filteredValue, { emitEvent: false });
    }
  }

  onSubmit() {
    this.serverErrorMessage.set(null);
    if (this.registerForm.valid) {
      const { user_password_confirm, ...payload } = this.registerForm.getRawValue();

      this.api.register(payload as UserRegister).subscribe({
        next: () => {
          this.router.navigate(['collections/all']);
        },
        error: (err: HttpErrorResponse) => {
          this.handleRegisterError(err);
        },
      });
    }
  }

  private handleRegisterError(err: HttpErrorResponse) {
    if (err.status === 409) {
      this.serverErrorMessage.set('El email ya está registrado');
    } else if (err.status === 400 || err.status === 401) {
      this.serverErrorMessage.set('Datos inválidos');
    } else {
      this.serverErrorMessage.set('Ocurrió un error inesperado');
    }
  }
}
