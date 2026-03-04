import { Injectable, inject, signal } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { User, UserLogin, UserRegister } from '@/app/core/models/user.models';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly routes = ENDPOINTS.USER;
  public currentUser = signal<User | null>(null);
  public isLoggedIn = signal(false);
  public pending2FAQRCode = signal<string | null>(null);
  public pending2FACredentials = signal<UserLogin | null>(null);

  login(credentials: UserLogin): Observable<ApiResponse<User>> {
    return this.api
      .post<User, UserLogin>(`${this.routes.BASE}/${this.routes.LOGIN}`, credentials)
      .pipe(
        switchMap((res) => {
          if (!res.requires2FA) {
            this.isLoggedIn.set(true);
            this.loadCurrentUser();
          }
          return of(res);
        }),
      );
  }

  verify2FA(credentials: UserLogin | null, token: string): Observable<ApiResponse<User>> {
    return this.api
      .post<
        User,
        UserLogin | { token: string }
      >(`${this.routes.BASE}/${this.routes.VERIFY_2FA}`, credentials ? { ...credentials, token } : { token })
      .pipe(
        tap(() => {
          this.isLoggedIn.set(true);
          this.loadCurrentUser();
        }),
      );
  }

  loginWithGoogle(credential: string): Observable<ApiResponse<User>> {
    return this.api
      .post<User, { credential: string }>(`${this.routes.BASE}/${this.routes.GOOGLE_LOGIN}`, {
        credential,
      })
      .pipe(
        tap(() => {
          this.isLoggedIn.set(true);
          this.loadCurrentUser();
        }),
      );
  }

  register(data: UserRegister): Observable<ApiResponse<User>> {
    return this.api
      .post<User, UserRegister>(`${this.routes.BASE}/${this.routes.REGISTER}`, data)
      .pipe(
        tap(() => {
          this.isLoggedIn.set(true);
          this.loadCurrentUser();
        }),
      );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.api.post<void>(`${this.routes.BASE}/${this.routes.LOGOUT}`).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
      }),
    );
  }

  checkSession(): Observable<ApiResponse<User> | null> {
    return this.api.get<User>(`${this.routes.BASE}/${this.routes.PROFILE}`).pipe(
      tap((res) => {
        this.currentUser.set(res.data);
        this.isLoggedIn.set(true);
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        return of(null);
      }),
    );
  }

  private loadCurrentUser(): void {
    this.api
      .get<User>(`${this.routes.BASE}/${this.routes.PROFILE}`)
      .subscribe((res) => this.currentUser.set(res.data));
  }
}
