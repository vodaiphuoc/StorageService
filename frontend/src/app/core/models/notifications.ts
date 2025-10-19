export interface NotificationModel {
    type: 'success' | 'error' | 'warning' | 'info';
    source: string;
    message: string;
    duration: number; //in second
}