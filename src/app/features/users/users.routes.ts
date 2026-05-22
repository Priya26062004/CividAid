import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./user-details/user-details.component').then(m => m.UserDetailsComponent)
  }
];
