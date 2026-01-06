import { Injectable, inject } from '@angular/core';
import { ApiService, ApiResponse } from '../api';
import { ENDPOINTS } from '../constants/endpoints';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

export type UserLogin = Pick<User, 'email'> & { user_password: string };
export type UserRegister = Omit<User, 'id' | 'role' | 'phone'> & { user_password: string };

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);
  private readonly routes = ENDPOINTS.USER;

  userLogin(u: UserLogin): Observable<ApiResponse<User>> {
    return this.api.post<User, UserLogin>(`${this.routes.BASE}/${this.routes.LOGIN}`, u);
  }

  userRegister(u: UserRegister): Observable<ApiResponse<User>> {
    return this.api.post<User, UserRegister>(`${this.routes.BASE}/${this.routes.REGISTER}`, u);
  }

  userLoginWithGoogle(credential: string): Observable<ApiResponse<User>> {
    return this.api.post<User, { credential: string }>(
      `${this.routes.BASE}/${this.routes.GOOGLE_LOGIN}`,
      {
        credential,
      }
    );
  }

  userLogout(): Observable<ApiResponse<null>> {
    return this.api.post<null>(`${this.routes.BASE}/${this.routes.LOGOUT}`);
  }

  getUserProfile(): Observable<ApiResponse<User>> {
    return this.api.get<User>(`${this.routes.BASE}/${this.routes.PROFILE}`);
  }
}
