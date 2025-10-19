import { Component, inject } from '@angular/core';
import {
    MatSnackBar
  } from '@angular/material/snack-bar';

import { NotificationService } from '@core/services/notification';
import { NotificationModel } from '@core/models/notifications';

@Component({
    selector: 'app-notification',
    imports: [],
    templateUrl: './notification.html',
    styleUrl: './notification.css'
})
export class Notification {

    private notificationService: NotificationService = inject(NotificationService);
    private snackBar: MatSnackBar = inject(MatSnackBar);

    ngOnInit(): void {
        // Subscribe to the observable
        this.notificationService.notification$.subscribe(notification => {
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
}
