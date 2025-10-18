import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RegisterModel, LoginModel } from '../models/authen-request';

@Injectable({
    providedIn: 'root'
})
export class AuthenService {
    private apiUrl = '';
    isRefreshing = false;

    constructor(private http: HttpClient, private router: Router) {
    }

    registerNewAccount(registerData: RegisterModel) {
        this.http.post(`${this.apiUrl}/api/register`, registerData)
            .subscribe({
                next: responseData => {
                    console.log(responseData);
                    this.router.navigate(['/app']);
                }
            })
    }

    refreshToken(): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/refresh`, {}, { withCredentials: true }).pipe(
            catchError(err => {
                return throwError(() => err);
            }),
            finalize(() => {
                this.isRefreshing = false;
            })
        );
    }

    checkProtected(): Observable<boolean> {
        return this.http.get(
            `${this.apiUrl}/api/protected`,
            { observe: 'response', withCredentials: true })
            .pipe(
                map((response) => response.status === 200),
                catchError(() => of(false))
        );
    }

    login(loginData: LoginModel): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/login`,
            loginData,
            { withCredentials: true }
        );
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
            .subscribe({
                next: () => {
                console.log('Logged out successfully');
                window.location.href = '/login';
                },
                error: (err) => {
                console.error('Logout failed', err);
                window.location.href = '/login';
                }
            });
    }

    finalizeRefresh() {
        return <T>(source: Observable<T>) =>
            source.pipe(
                finalize(() => {
                this.isRefreshing = false;
                })
            );
    }
}
