import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '@/pages/account/account.model';
import { CzCurrencyPipe } from '@/pages/currency/formaters/cz-currency-formatter';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-account-widget',
    imports: [CommonModule, CzCurrencyPipe],
    template: `
        <div
            class="card mb-0 relative cursor-pointer transition-shadow duration-200 hover:shadow-lg"
            (click)="goToDetail()"
        >
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-2">
                        {{ account.name }}
                    </span>
                    <div class="font-medium text-xl" [ngClass]="balanceColor"> <!-- TODO tady se nemusí obarvovat, tady bude vždy kladná. Přidám field monthly balance, který se bude obarvovat -->
                        {{ account.currentBalance | czCurrency }} <!-- TODO: udělat formátování podlě měny-->
                    </div>
                    <div class="text-muted-color text-sm">
                        {{ account.code }}
                    </div>
                </div>

                <div class="flex items-center justify-center bg-primary-100 dark:bg-primary-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-wallet text-primary-500 text-xl!"></i>
                </div>
            </div>
        </div>
    `
})
export class AccountWidgetComponent {
    @Input({ required: true }) account!: Account;

    constructor(private router: Router) {}

    get balanceColor(): string {
        return this.account.currentBalance < 0
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-600 dark:text-green-400';
    }

    goToDetail() {
        void this.router.navigate(['/account', this.account.id]);
    }
}
