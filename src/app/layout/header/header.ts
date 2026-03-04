import { Component, inject, resource, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '@/app/core/services/category.service';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Header {
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  categories = resource({
    loader: () => firstValueFrom(this.categoryService.getAll()).then((response) => response.data),
  });

  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;
  accountMenuOpen = signal(false);

  toggleAccountMenu(): void {
    this.accountMenuOpen.update((open) => !open);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.accountMenuOpen.set(false);
        void this.router.navigate(['/login']);
      },
      error: (err) => console.error('Logout failed:', err),
    });
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__account')) {
      this.accountMenuOpen.set(false);
    }
  }
}
