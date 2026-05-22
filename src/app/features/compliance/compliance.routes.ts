import { Routes } from '@angular/router';

export const COMPLIANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./compliance-check/compliance-check.component').then(m => m.ComplianceCheckComponent)
  }
];
