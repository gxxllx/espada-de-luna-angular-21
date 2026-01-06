import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { User, UserLogin, UserRegister } from '@/app/core/models/user.types';
import { Observable, tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly routes = ENDPOINTS.USER;
  public currentUser = signal<User | null>(null);
  public isLoggedIn = computed(() => !!this.currentUser());

  login(credentials: UserLogin): Observable<ApiResponse<User>> {
    return this.api
      .post<User, UserLogin>(`${this.routes.BASE}/${this.routes.LOGIN}`, credentials)
      .pipe(tap((res) => this.currentUser.set(res.data)));
  }

  loginWithGoogle(credential: string): Observable<ApiResponse<User>> {
    return this.api
      .post<User, { credential: string }>(`${this.routes.BASE}/${this.routes.GOOGLE_LOGIN}`, {
        credential,
      })
      .pipe(tap((res) => this.currentUser.set(res.data)));
  }

  register(data: UserRegister): Observable<ApiResponse<User>> {
    return this.api
      .post<User, UserRegister>(`${this.routes.BASE}/${this.routes.REGISTER}`, data)
      .pipe(tap((res) => this.currentUser.set(res.data)));
  }

  logout(): Observable<ApiResponse<void>> {
    return this.api
      .post<void>(`${this.routes.BASE}/${this.routes.LOGOUT}`)
      .pipe(tap(() => this.currentUser.set(null)));
  }

  checkSession(): Observable<ApiResponse<User> | null> {
    return this.api.get<User>(`${this.routes.BASE}/${this.routes.PROFILE}`).pipe(
      tap((res) => this.currentUser.set(res.data)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }
}
