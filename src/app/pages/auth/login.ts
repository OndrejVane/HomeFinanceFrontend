import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { AppLogo } from '@/layout/component/app.logo';
import { AuthService } from '@/auth/auth.service';
import { UserLoginRequest } from '@/model/userLoginRequest';
import { Message } from 'primeng/message';
import { NgIf } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, AppLogo, Message, NgIf, ReactiveFormsModule, TranslatePipe],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <app-logo />
                            <span class="text-muted-color font-medium">{{ 'loginToContinue' | translate }}</span>
                        </div>

                        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                            <div>
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{'email' | translate}}</label>
                                <input formControlName="email" pInputText id="email1" type="email" placeholder="{{'emailAddress' | translate}}" class="w-full md:w-120 mb-8" />

                                <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{'password' | translate}}</label>
                                <p-password formControlName="password" id="password1" type="password" placeholder="{{'password' | translate}}" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                    <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary" routerLink="/register">{{'dontHaveAccount' | translate}} </span>
                                    <span class="font-medium no-underline ml-2 text-right text-gray-400 cursor-not-allowed pointer-events-none">{{'forgotPassword' | translate}}</span>
                                </div>

                                <p-button label="{{'login' | translate}}" type="submit" styleClass="w-full" [disabled]="loginForm.invalid"></p-button>
                                <p-message *ngIf="errorMessage" severity="error" class="w-full md:w-120 mb-8">{{ errorMessage }}</p-message>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login implements OnInit {
    loginForm!: FormGroup;
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.invalid) return;

        const loginRequest: UserLoginRequest = {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        };

        this.auth.login(loginRequest).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.errorMessage = err.error?.message || this.translate.instant('loginFailed');
            }
        });
    }
}
