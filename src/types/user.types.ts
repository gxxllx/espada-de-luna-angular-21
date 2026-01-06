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
