import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./report-dashboard/report-dashboard.component').then(m => m.ReportDashboardComponent)
  }
];
