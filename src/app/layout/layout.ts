import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';
import { environment } from '@/environments/environment';
import { ThemeService } from '@/app/core/services/theme.service';

@Component({
  selector: 'app-layout',
  imports: [Header, RouterOutlet, Footer, Sidebar],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class Layout {
  isAdmin = environment.isAdmin;
  sidebarCollapsed = signal(false);

  constructor() {
    if (this.isAdmin) {
      inject(ThemeService).apply();
    }
  }
}
