import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenService } from '../services/authen-service';
import { map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authenGuard: CanActivateFn = (route, state) => {
    const authenService = inject(AuthenService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar); // <-- Inject MatSnackBar

    return authenService.checkProtected().pipe(
        map(isAuth => {
            if (isAuth) return true;
            snackBar.open(
                'You need to log in to access this page.',
                'Close',
                { duration: 10000 }
            );
            return router.createUrlTree(['/']);
        })
    )
};
