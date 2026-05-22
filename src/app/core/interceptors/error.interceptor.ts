import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          authService.logout();
          break;
        case 403:
          // Don't redirect to /unauthorized for background data-loading calls
          // (e.g. trying to fetch /users/getallusers after login as CITIZEN).
          // Only redirect if the user is intentionally navigating to a protected page.
          // We check: if the URL is a "list all" type call, silently swallow the 403.
          const url = req.url;
          const isSilentCall = url.includes('/getallusers') ||
                               url.includes('/unread') ||
                               url.includes('/notifications/user/');
          if (!isSilentCall) {
            router.navigate(['/unauthorized']);
          }
          break;
        case 0:
          console.error('Backend server is unreachable');
          break;
      }
      return throwError(() => error);
    })
  );
};
