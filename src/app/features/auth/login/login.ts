import { Component, inject, signal, afterNextRender, viewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Input } from '@/app/shared/components/input/input';
import { Button } from '@/app/shared/components/button/button';
import { UserLogin } from '@/app/core/models/user.models';
import { AuthService } from '@/app/core/services/auth.service';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Input, Button],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private readonly api = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');

  serverEmailError = signal<string | null>(null);
  serverPasswordError = signal<string | null>(null);
  serverError = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    user_password: ['', Validators.required],
  });

  constructor() {
    afterNextRender(() => {
      this.initializeGoogleSignIn();
    });
  }

  private initializeGoogleSignIn() {
    const clientId = environment.googleClientId;

    if (!clientId) {
      console.error('Google Client ID is not defined in environment variables');
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleIdentity.CredentialResponse) => {
        this.loginWithGoogle(response.credential);
      },
    });

    const buttonElement = this.googleBtn()?.nativeElement;
    if (buttonElement) {
      google.accounts.id.renderButton(buttonElement, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
      });
    }
  }

  clearServerErrors() {
    this.serverEmailError.set(null);
    this.serverPasswordError.set(null);
    this.serverError.set(null);
  }

  onSubmit() {
    this.clearServerErrors();
    if (this.loginForm.valid) {
      const payload = this.loginForm.getRawValue() as UserLogin;

      this.api.login(payload).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['collections/all']);
        },
        error: (err: HttpErrorResponse) => {
          this.handleLoginError(err);
        },
      });
    }
  }

  loginWithGoogle(credential: string) {
    this.clearServerErrors();
    this.api.loginWithGoogle(credential).subscribe({
      next: (response) => {
        console.log('Google login successful:', response);
        this.router.navigate(['collections/all']);
      },
      error: (err: HttpErrorResponse) => {
        this.handleLoginError(err);
      },
    });
  }

  private handleLoginError(err: HttpErrorResponse) {
    if (err.status === 404) {
      this.serverEmailError.set('Email no registrado');
    } else if (err.status === 401 || err.status === 400) {
      this.serverPasswordError.set('Contraseña incorrecta');
    } else {
      this.serverError.set('Ocurrió un error inesperado');
    }
  }
}
