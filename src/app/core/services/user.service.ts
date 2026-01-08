import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable } from 'rxjs';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
  private readonly routes = ENDPOINTS.USER;

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.patch<User>(`${this.routes.BASE}/${this.routes.PROFILE}`, data);
  }

  forgotPassword(email: string): Observable<ApiResponse<User>> {
    return this.api.post<User, { email: string }>(`${this.routes.BASE}/${this.routes.FORGOT}`, {
      email,
    });
  }

  resetPassword(user_password: string): Observable<ApiResponse<User>> {
    return this.api.patch<User, { user_password: string }>(
      `${this.routes.BASE}/${this.routes.RESET}`,
      {
        user_password,
      }
    );
  }

  sendVerificationEmail(): Observable<ApiResponse<void>> {
    return this.api.post<void>(`${this.routes.BASE}/${this.routes.SEND_VERIFICATION}`);
  }

  verifyEmail(): Observable<ApiResponse<void>> {
    return this.api.post<void>(`${this.routes.BASE}/${this.routes.VERIFY}`);
  }
}
