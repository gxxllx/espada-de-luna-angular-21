import { Component, inject, resource } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '@/app/core/services/category.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  private readonly api = inject(CategoryService);

  categories = resource({
    loader: () => firstValueFrom(this.api.getAll()).then((response) => response.data),
  });
}
