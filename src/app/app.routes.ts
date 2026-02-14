import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { ADMIN_ROUTES } from './routes/app.admin.routes';
import { USER_ROUTES } from './routes/app.user.routes';

export const routes: Routes = environment.isAdmin ? ADMIN_ROUTES : USER_ROUTES;
