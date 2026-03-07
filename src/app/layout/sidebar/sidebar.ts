import { Component, computed, inject, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';
import { ThemeService } from '@/app/core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  collapsed = signal(false);
  collapsedChange = output<boolean>();

  isDark = computed(() => this.themeService.theme() === 'dark');

  adminName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.first_name} ${user.last_name}` : 'Admin';
  });

  toggle() {
    this.collapsed.update((v) => !v);
    this.collapsedChange.emit(this.collapsed());
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout failed:', err),
    });
  }
}
