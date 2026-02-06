import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Input } from '@/app/shared/components/input/input';
import { Button } from '@/app/shared/components/button/button';
import { UserRegister } from '@/app/core/models/user.models';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, Input, Button],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly api = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  passwordStrength = signal({ width: '1%', color: '#d73f40' });

  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    user_password: ['', Validators.required],
    user_password_confirm: ['', Validators.required],
  });

  constructor() {
    this.registerForm.get('user_password')?.valueChanges.subscribe((value) => {
      this.checkPasswordStrength(value || '');
    });
  }

  checkPasswordStrength(value: string) {
    let point = 0;
    const widthPower = ['1%', '25%', '50%', '75%', '100%'];
    const colorPower = ['#d73f40', '#dc6551', '#f2b84f', '#bde952', '#3ba62f'];

    if (value.length >= 6) {
      const arrayTest = [/\d/, /[a-z]/, /[A-Z]/, /\W/];
      arrayTest.forEach((item) => {
        if (item.test(value)) {
          point += 1;
        }
      });
    }

    this.passwordStrength.set({
      width: widthPower[point],
      color: colorPower[point],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const payload = this.registerForm.getRawValue() as UserRegister;

      this.api.register(payload).subscribe({
        next: (response) => {
          console.log('Register successful:', response);
        },
        error: (err) => {
          console.error('Register error:', err);
        },
      });
    }
  }
}
