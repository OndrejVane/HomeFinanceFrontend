import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '@/pages/account/account.model';
import { Router } from '@angular/router';
import { CzkCurrencyPipe } from '@/pages/currency/formaters/currency/cz-currency-formatter';
import { CurrencyFormatPipe } from '@/pages/currency/formaters/currency/currency-formatter';

@Component({
    standalone: true,
    selector: 'app-account-widget',
    imports: [CommonModule, CzkCurrencyPipe, CurrencyFormatPipe, CzkCurrencyPipe],
    template: `
        <div class="card mb-0 relative cursor-pointer transition-shadow duration-200 hover:shadow-lg" (click)="goToDetail()">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium text-lg mb-2">
                        {{ account.name }}
                    </span>
                    <div class="font-medium text-xl" [ngClass]="balanceColor">
                        {{ account.currentBalanceCzk | czkCurrency }}
                        <!-- TODO: udělat formátování podlě měny-->
                    </div>
                    <div class="font-medium text-sm" [ngClass]="balanceColor">
                        {{ account.currentBalance | currencyFormat: account.currencyCode }}
                        <!-- TODO: udělat formátování podlě měny-->
                    </div>
                    <div class="text-muted-color text-sm mt-2">
                        Posledních 30 dní:
                        <span [ngClass]="balanceColor">
                            {{ account.last30DaysBalance }}
                        </span>
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
        return this.account.currentBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    }

    goToDetail() {
        void this.router.navigate(['/account', this.account.id]);
    }
}
