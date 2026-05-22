import { Routes } from '@angular/router';

export const DISBURSEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./disbursement-list/disbursement-list.component').then(m => m.DisbursementListComponent)
  }
];
