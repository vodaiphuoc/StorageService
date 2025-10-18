import { Component, output, inject } from '@angular/core';
import {
    FormGroup,
    FormControl,
    ReactiveFormsModule,
    AbstractControl,
    ValidatorFn,
    ValidationErrors
} from '@angular/forms';
import {Validators} from '@angular/forms';

import {OverlayModule} from '@angular/cdk/overlay';
import { ConnectionPositionPair } from '@angular/cdk/overlay';

import { RegisterModel } from '../../../../core/models/authen-request';
import { AuthenService } from '../../../../core/services/authen-service';

/**
 * check matching of password and repeat password
 * 
 * @param {AbstractControl} control 
 * @returns {ValidationErrors | null}
 */
export const checkRepeatPasswordValidator: ValidatorFn = (
        control: AbstractControl,
    ): ValidationErrors | null => {
        const password = control.get('password');
        const repeatPassword = control.get('repeatPassword');
        
        return password &&
            repeatPassword &&
            password.touched &&
            password.value !== repeatPassword.value
            ?
            { notMatchPwd: true }
            : null;
};

/**
 * Check password strength
 * @returns {ValidationErrors | null}
 */
export function passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string;

        if (!value) {
            return null;
        }

        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumeric = /[0-9]/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

        const passwordValid =
        hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

        return passwordValid
        ? null
        : {
            passwordStrength: {
                hasUpperCase,
                hasLowerCase,
                hasNumeric,
                hasSpecial,
            },
        };
    };
}


@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, OverlayModule],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class Register {
    showLogin = output();

    private authenService: AuthenService = inject(AuthenService);

    pwdOverlayPositions: ConnectionPositionPair[] = [
        {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center',
            offsetX: 30
        }
    ];


    // form fields
    registerForm = new FormGroup({
        fullName: new FormControl<string>('', {
            nonNullable: true,
            validators: [
                Validators.required
            ]
        }),
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
                Validators.required,
                Validators.minLength(4),
                passwordStrengthValidator()
            ]
        }),
        repeatPassword: new FormControl<string>('', {
            nonNullable: true,
            validators: [
                Validators.required
            ]
        })
    }, {
        validators: checkRepeatPasswordValidator
    }
    );

    get fullName(): FormControl<string> {
        return this.registerForm.controls.fullName;
    }

    get email(): FormControl<string> {
        return this.registerForm.controls.email;
    }

    get password(): FormControl<string> {
        return this.registerForm.controls.password;
    }
    
    onSubmit() {
        if (this.registerForm.valid) {
            console.log('Form submitted:', this.registerForm.value);
            const data = this.registerForm.value as RegisterModel;
            this.authenService.registerNewAccount(data);
        } else {
            this.registerForm.markAllAsTouched();
            console.warn('Form invalid');
        }
    }
}
