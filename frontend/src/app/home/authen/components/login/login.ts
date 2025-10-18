import { Component, output, inject } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {Validators} from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { AuthenService } from '../../../../core/services/authen-service';
import { LoginModel } from '../../../../core/models/authen-request';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, MatIconModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {

    showRegister = output();

    private authenService = inject(AuthenService);

    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer    
    ) {
        this.matIconRegistry
            .addSvgIcon(
                'eye-visible',
                this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/pwd-eyes/eye.svg')
            ).addSvgIcon(
                'eye-non-visible',
                this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/pwd-eyes/eye-slash.svg')
        );
    }

    passwordVisible = false;

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    // form fields
    loginForm = new FormGroup({
        email: new FormControl<string>('', {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern('[A-Za-z0-9]+@gmail.com')
            ]
        }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [
                Validators.required
            ]
        })
    });

    get email(): FormControl<string> {
        return this.loginForm.controls.email;
    }

    get password(): FormControl<string> {
        return this.loginForm.controls.password;
    }
    
    onSubmit() {
        if (this.loginForm.valid) {
            const requestData = this.loginForm.value as LoginModel;
            this.authenService.login(requestData);
        } else {
            this.loginForm.markAllAsTouched();
            console.warn('Form invalid');
        }
        console.log('Form submitted:', this.loginForm.value);
    }
}

