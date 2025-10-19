import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import type { NotificationModel } from '@core/models/notifications';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationSubject = new Subject<NotificationModel>();

    get notification$(): Observable<NotificationModel> {
        return this.notificationSubject.asObservable();
    }

    notify(notification: NotificationModel): void {
        this.notificationSubject.next(notification);
    }

    // Convenience methods
    success(source:string, message: string, duration: number): void {
        this.notify({ type: 'success', source, message, duration });
    }

    error(source: string, message: string, duration: number): void {
        this.notify({ type: 'error', source, message, duration });
    }
}
