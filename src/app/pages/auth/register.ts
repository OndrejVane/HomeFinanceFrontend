import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { Message } from 'primeng/message';
import { AppLogo } from '@/layout/component/app.logo';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, AppLogo],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <app-logo/>
                            <span class="text-muted-color font-medium">Register to continue</span>
                        </div>

                        <div>
                            <label for="firstName" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">First name</label>
                            <input pInputText id="firstName" type="text" placeholder="First name" class="w-full md:w-120 mb-8" [(ngModel)]="firstName" />

                            <label for="lastName" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">First name</label>
                            <input pInputText id="lastName" type="text" placeholder="Last name" class="w-full md:w-120 mb-8" [(ngModel)]="lastName" />

                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary" routerLink="/login">Already have an account?</span>
                                <span class="font-medium no-underline ml-2 text-right text-gray-400 cursor-not-allowed pointer-events-none">Forgot password?</span>
                            </div>
                            <p-button label="Register" styleClass="w-full" routerLink="/login"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Register {
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';
}
