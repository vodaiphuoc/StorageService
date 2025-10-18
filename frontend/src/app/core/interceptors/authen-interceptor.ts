import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenService } from '../services/authen-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
    const authenService = inject(AuthenService);

    console.log('client inspect req: ', req);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !authenService.isRefreshing && error.message === 'Invalid or Expired') {
                authenService.isRefreshing = true;

                // Try refreshing token
                return authenService.refreshToken().pipe(
                    switchMap(() => {
                        // Retry original request after refresh
                        return next(req);
                    }),
                    catchError(refreshError => {
                        // Refresh also failed → logout
                        authenService.logout();
                        return throwError(() => refreshError);
                    }),
                    // reset refreshing flag
                    authenService.finalizeRefresh()
                );
            }
            
            return throwError(() => error);
        })
    );
};
