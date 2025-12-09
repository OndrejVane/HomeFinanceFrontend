import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { Message } from 'primeng/message';
import { AppLogo } from '@/layout/component/app.logo';
import { AuthService } from '@/auth/auth.service';
import { UserRegisterRequest } from '@/model/userRegisterRequest';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, AppLogo, ReactiveFormsModule, Message, CommonModule],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <app-logo />
                            <span class="text-muted-color font-medium">Register to continue</span>
                        </div>
                        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                            <div>
                                <label for="firstName" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">First name</label>
                                <input formControlName="firstName" pInputText id="firstName" type="text" placeholder="First name" class="w-full md:w-120 mb-8" />

                                <label for="lastName" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">First name</label>
                                <input formControlName="lastName" pInputText id="lastName" type="text" placeholder="Last name" class="w-full md:w-120 mb-8" />

                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                                <input formControlName="email" pInputText id="email1" type="email" placeholder="Email address" class="w-full md:w-120 mb-8" />

                                <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                                <p-password formControlName="password" id="password1" type="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                    <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary" routerLink="/login">Already have an account?</span>
                                    <span class="font-medium no-underline ml-2 text-right text-gray-400 cursor-not-allowed pointer-events-none">Forgot password?</span>
                                </div>

                                <p-button label="Register" type="submit" styleClass="w-full" [disabled]="registerForm.invalid"></p-button>
                                <p-message *ngIf="errorMessage" severity="error" class="w-full md:w-120 mb-8">{{ errorMessage }}</p-message>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register implements OnInit {
    registerForm!: FormGroup;
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.registerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.registerForm.invalid) return;

        const registerRequest: UserRegisterRequest = {
            firstName: this.registerForm.value.firstName,
            lastName: this.registerForm.value.lastName,
            email: this.registerForm.value.email,
            password: this.registerForm.value.password
        };

        this.auth.register(registerRequest).subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Registrace selhala';
            }
        });
    }
}
