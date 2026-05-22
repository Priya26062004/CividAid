import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { Role } from '../../core/models/role.enum';

export const PROGRAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./program-list/program-list.component').then(m => m.ProgramListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./program-create/program-create.component').then(m => m.ProgramCreateComponent),
    canActivate: [roleGuard],
    data: { roles: [Role.PROGRAM_MANAGER, Role.ADMINISTRATOR] }
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./program-edit/program-edit.component').then(m => m.ProgramEditComponent),
    canActivate: [roleGuard],
    data: { roles: [Role.PROGRAM_MANAGER, Role.ADMINISTRATOR] }
  }
];
