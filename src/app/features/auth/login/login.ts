import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserLogin } from '@/app/core/models/user.models';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private readonly api = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    user_password: ['', Validators.required],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const payload = this.loginForm.getRawValue() as UserLogin;

      this.api.login(payload).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
        },
        error: (err) => {
          console.error('Error de login', err);
        },
      });
    }
  }
}
