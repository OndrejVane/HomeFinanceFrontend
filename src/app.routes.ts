import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { Login } from './app/pages/auth/login';
import { Register } from './app/pages/auth/register';
import { AuthGuard } from '@/auth/auth.guard';
import { GuestGuard } from '@/auth/guest.guard';
import { CurrencyPage } from '@/pages/currency/currency.page';

export const appRoutes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login , canActivate: [GuestGuard]},
    { path: 'register', component: Register, canActivate: [GuestGuard] },
    { path: 'notfound', component: Notfound, canActivate: [GuestGuard] },
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'currency', component: CurrencyPage },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'landing', component: Landing }
        ],
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: 'notfound' },
];
