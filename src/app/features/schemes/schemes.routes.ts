import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../core/models/role.enum';

export const SCHEMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./scheme-list/scheme-list.component').then(m => m.SchemeListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./scheme-create/scheme-create.component').then(m => m.SchemeCreateComponent),
    canActivate: [roleGuard],
    data: { roles: [Role.PROGRAM_MANAGER, Role.ADMINISTRATOR] }
  },
  {
    path: ':id',
    loadComponent: () => import('./scheme-detail/scheme-detail.component').then(m => m.SchemeDetailComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./scheme-edit/scheme-edit.component').then(m => m.SchemeEditComponent),
    canActivate: [roleGuard],
    data: { roles: [Role.PROGRAM_MANAGER, Role.ADMINISTRATOR] }
  }
];
