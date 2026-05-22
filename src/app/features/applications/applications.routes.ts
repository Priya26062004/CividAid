import { Routes } from '@angular/router';

export const APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./application-status/application-status.component').then(m => m.ApplicationStatusComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./application-create/application-create.component').then(m => m.ApplicationCreateComponent)
  }
];
