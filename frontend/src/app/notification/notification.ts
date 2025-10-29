import { Component, inject, type OnInit, type OnDestroy } from '@angular/core';
import {
    MatSnackBar
  } from '@angular/material/snack-bar';

import { NotificationService } from '@core/services/notification';
import type { NotificationModel } from '@core/models/notifications';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-notification',
    imports: [],
    templateUrl: './notification.html',
    styleUrl: './notification.css'
})
export class Notification implements OnInit, OnDestroy{
    private destroy$ = new Subject<void>();

    private notificationService: NotificationService = inject(NotificationService);
    private snackBar: MatSnackBar = inject(MatSnackBar);

    ngOnInit(): void {
        // Subscribe to the observable
        this.notificationService.notification$
            .pipe(takeUntil(this.destroy$))
            .subscribe(notification => {
            console.log('get notification: ', notification);
            this.displayNotification(notification);
        });
    }

    private displayNotification(notification: NotificationModel): void {
        const msg: string = `${notification.type.toUpperCase()} in ${notification.source}, ${notification.message}`;
        this.snackBar.open(msg, 'Splash', {
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            duration: notification.duration*1000
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
