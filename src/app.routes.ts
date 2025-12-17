import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Landing } from '@/pages/landing/landing';
import { Notfound } from '@/pages/notfound/notfound';
import { Login } from '@/pages/auth/login';
import { Register } from '@/pages/auth/register';
import { AuthGuard } from '@/auth/auth.guard';
import { GuestGuard } from '@/auth/guest.guard';
import { CurrencyPage } from '@/pages/currency/currency.page';
import { AccountsPage } from '@/pages/account/accounts.page';
import { AccountPage } from '@/pages/account/account.page';

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
            { path: 'account', component: AccountsPage },
            { path: 'account/:id', component: AccountPage },
            { path: 'currency', component: CurrencyPage },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'landing', component: Landing }
        ],
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: 'notfound' },
];
