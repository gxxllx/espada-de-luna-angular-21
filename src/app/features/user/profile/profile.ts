import { Component, effect, inject, signal } from '@angular/core';
import { UserService } from '@/app/core/services/user.service';
import { User } from '../../core/models/user.models';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  userProfile = signal<User | null>(null);

  constructor() {
    effect(() => {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.userProfile.set(currentUser);
      } else {
        this.loadUserProfile();
      }
    });
  }

  private loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        console.log('User profile loaded:', response.data);
        this.userProfile.set(response.data);
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
      },
    });
  }
}
