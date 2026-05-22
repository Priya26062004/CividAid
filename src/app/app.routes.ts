import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { Role } from './core/models/role.enum';
//means that when user tries to access a route, the authGuard will check if they are authenticated. If not, they will be redirected to the login page. If they are authenticated but do not have the required role, they will be redirected to the unauthorized page.
export const routes: Routes = [ 
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }, //means that when user accesses the root URL, they will be redirected to the login page.
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES), //what is loadChildren? It is a way to lazy load the auth module. This means that the auth module will only be loaded when the user navigates to the /auth route. This can improve the initial load time of the application.
    canActivate: [guestGuard] //what is canActivate? It is a way to protect routes. In this case, the guestGuard will check if the user is already authenticated. If they are, they will be redirected to the dashboard page. This prevents authenticated users from accessing the login and register pages.
  },
  {
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard] //means that when user tries to access the dashboard route, the authGuard will check if they are authenticated. If not, they will be redirected to the login page.
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMINISTRATOR] }
  },
  {
    path: 'citizens',
    loadChildren: () => import('./features/citizens/citizens.routes').then(m => m.CITIZENS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'programs',
    loadChildren: () => import('./features/programs/programs.routes').then(m => m.PROGRAMS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'schemes',
    loadChildren: () => import('./features/schemes/schemes.routes').then(m => m.SCHEMES_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'applications',
    loadChildren: () => import('./features/applications/applications.routes').then(m => m.APPLICATIONS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'disbursements',
    loadChildren: () => import('./features/disbursement/disbursement.routes').then(m => m.DISBURSEMENT_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.WELFARE_OFFICER, Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER] }
  },
  {
    path: 'compliance',
    loadChildren: () => import('./features/compliance/compliance.routes').then(m => m.COMPLIANCE_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR, Role.ADMINISTRATOR] }
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMINISTRATOR, Role.COMPLIANCE_OFFICER, Role.GOVERNMENT_AUDITOR] }
  },
  {
    path: 'payments',
    loadChildren: () => import('./features/payment/payment.routes').then(m => m.PAYMENT_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.WELFARE_OFFICER, Role.ADMINISTRATOR] }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  { path: '**', redirectTo: '/auth/login' }
];
