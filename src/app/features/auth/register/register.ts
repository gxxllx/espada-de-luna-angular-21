import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Input } from '@/app/shared/components/input/input';
import { Button } from '@/app/shared/components/button/button';
import { UserRegister } from '@/app/core/models/user.models';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, Input, Button],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register {
  private readonly api = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  serverErrorMessage = signal<string | null>(null);
  passwordStrength = signal({ width: '1%', color: '#d73f40' });

  registerForm = this.fb.group(
    {
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

  onSubmit() {
    this.serverErrorMessage.set(null);
    if (this.registerForm.valid) {
      const { user_password_confirm, ...payload } = this.registerForm.getRawValue();

      this.api.register(payload as UserRegister).subscribe({
        next: (response) => {
          console.log('Register successful:', response);
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
