import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth headers to requests if user is authenticated
  if (authService.isAuthenticated()) {
    const authHeaders = authService.getAuthHeaders();
    const headersObj: { [key: string]: string } = {};
    authHeaders.keys().forEach((key: string) => {
      headersObj[key] = authHeaders.get(key) || '';
    });

    req = req.clone({
      setHeaders: headersObj
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Unauthorized - clear auth and redirect to login
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};