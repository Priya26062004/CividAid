import { Routes } from '@angular/router';

export const CITIZENS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./citizen-profile/citizen-profile.component').then(m => m.CitizenProfileComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./citizen-edit/citizen-edit.component').then(m => m.CitizenEditComponent)
  }
];

