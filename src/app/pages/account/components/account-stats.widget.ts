import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountStatsResponse } from '@/pages/account/model/account-stats.model';
import { AccountService } from '@/pages/account/account.service';
import { CzDateFormatter } from '@/pages/currency/formaters/cz-date-formatter';
import { Account } from '@/pages/account/account.model';
import { CurrencyFormatPipe } from '@/pages/currency/formaters/currency/currency-formatter';
import { CzkCurrencyPipe } from '@/pages/currency/formaters/currency/cz-currency-formatter';


@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, CzDateFormatter, CzkCurrencyPipe, CurrencyFormatPipe],
    template: `
        <div *ngIf="loading" class="mb-1">Načítání statistik...</div>

        <div *ngIf="error" class="mb-1 text-red-500">Nepodařilo se načíst statistiky účtu.</div>

        <div *ngIf="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
            <!-- KARTA 0 LEVÁ: ZŮSTATEK -->
            <div class="card h-full !mb-0 !pt-1 !pb-1">
                <h3 class="font-semibold text-lg mb-2">Shrnutí účtu – zůstatek</h3>

                <div>
                    <span class="block text-muted-color font-medium mb-1">Aktuální zůstatek</span>
                    <div
                        class="text-surface-900 dark:text-surface-0 font-medium text-3xl"
                        [ngClass]="getAmountClass(stats.currentBalance)"
                    >
                        {{
                            account
                                ? (stats.currentBalance | currencyFormat: account.currencyCode)
                                : (stats.currentBalance | czkCurrency)
                        }}
                    </div>

                    <span *ngIf="account != null" class="text-muted-color text-sm block mt-1">
                        Aktuální zůstatek CZK: {{ account.currentBalanceCzk | czkCurrency }}
                    </span>

                    <span class="text-muted-color text-sm block mt-1">
                Počáteční zůstatek:
                        {{
                            account
                                ? (stats.initialBalance | currencyFormat: account.currencyCode)
                                : (stats.initialBalance | czkCurrency)
                        }}
            </span>
                </div>
            </div>

            <!-- KARTA 0 PRAVÁ: POHYBY -->
            <div class="card h-full !mb-0 !pt-1 !pb-1">
                <h3 class="font-semibold text-lg mb-2">Shrnutí účtu – pohyby</h3>

                <div>
                    <span class="block text-muted-color font-medium mb-1">Pohyby</span>
                    <span class="text-muted-color text-sm block"> Počet pohybů: {{ stats.movementsCount }} </span>
                    <span
                        class="text-muted-color text-sm block"
                        *ngIf="stats.lastMovementDate"
                    >
                Poslední pohyb: {{ stats.lastMovementDate | czDateFormatter }}
            </span>
                </div>
            </div>

            <!-- KARTA 1: CELKOVÉ STATISTIKY ÚČTU -->
            <div class="card h-full !mb-0 !pt-1 !pb-1">
                <h3 class="font-semibold text-lg mb-2">Celkové statistiky účtu</h3>

                <!-- Celkové pohyby -->
                <div class="mb-2 pb-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between mb-1">
                        <div>
                            <span class="block text-muted-color font-medium mb-1">Celkové pohyby</span>
                            <div class="font-medium text-xl" [ngClass]="getAmountClass(stats.netTotal)">
                                {{
                                    account
                                        ? (stats.netTotal | currencyFormat: account.currencyCode)
                                        : (stats.netTotal | czkCurrency)
                                }}
                            </div>
                        </div>
                    </div>

                    <span class="text-muted-color text-sm block">
                Příjmy/Výdaje:
                        {{
                            account
                                ? (stats.netFlow | currencyFormat: account.currencyCode)
                                : (stats.netFlow | czkCurrency)
                        }}
            </span>

                    <span class="text-muted-color text-sm">
                Výnosy/Náklady:
                        {{
                            account
                                ? (stats.netExpense | currencyFormat: account.currencyCode)
                                : (stats.netExpense | czkCurrency)
                        }}
            </span>
                </div>

                <!-- Celkové příjmy vs. výdaje -->
                <div class="mb-2 pb-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between mb-1">
                        <div>
                    <span class="block text-muted-color font-medium mb-1">
                        Celkové příjmy vs. výdaje
                    </span>
                            <div class="font-medium text-xl" [ngClass]="getAmountClass(stats.netFlow)">
                                {{
                                    account
                                        ? (stats.netFlow | currencyFormat: account.currencyCode)
                                        : (stats.netFlow | czkCurrency)
                                }}
                            </div>
                        </div>
                    </div>

                    <span class="text-muted-color text-sm block">
                Příjmy:
                        {{
                            account
                                ? (stats.totalInflow | currencyFormat: account.currencyCode)
                                : (stats.totalInflow | czkCurrency)
                        }}
            </span>

                    <span class="text-muted-color text-sm">
                Výdaje:
                        {{
                            account
                                ? (stats.totalOutflow | currencyFormat: account.currencyCode)
                                : (stats.totalOutflow | czkCurrency)
                        }}
            </span>
                </div>

                <!-- Celkové výnosy vs. náklady -->
                <div>
                    <div class="flex justify-between mb-1">
                        <div>
                    <span class="block text-muted-color font-medium mb-1">
                        Celkové výnosy vs. náklady
                    </span>
                            <div class="font-medium text-xl" [ngClass]="getAmountClass(stats.netExpense)">
                                {{
                                    account
                                        ? (stats.netExpense | currencyFormat: account.currencyCode)
                                        : (stats.netExpense | czkCurrency)
                                }}
                            </div>
                        </div>
                    </div>

                    <span class="text-muted-color text-sm block">
                Náklady:
                        {{
                            account
                                ? (stats.totalExpense | currencyFormat: account.currencyCode)
                                : (stats.totalExpense | czkCurrency)
                        }}
            </span>

                    <span class="text-muted-color text-sm">
                Výnosy:
                        {{
                            account
                                ? (stats.totalRevenue | currencyFormat: account.currencyCode)
                                : (stats.totalRevenue | czkCurrency)
                        }}
            </span>
                </div>
            </div>

            <!-- KARTA 2: STATISTIKY ZA POSLEDNÍCH 30 DNÍ -->
            <div class="card h-full !mb-0 !pt-1 !pb-1">
                <h3 class="font-semibold text-lg mb-2">Statistiky za posledních 30 dní</h3>

                <!-- Celkové pohyby za 30 dní -->
                <div class="mb-2 pb-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between mb-1">
                        <div>
                    <span class="block text-muted-color font-medium mb-1">
                        Celkové pohyby za posledních 30 dnů
                    </span>
                            <div
                                class="font-medium text-xl"
                                [ngClass]="getAmountClass(stats.last30DaysNetTotal)"
                            >
                                {{
                                    account
                                        ? (stats.last30DaysNetTotal | currencyFormat: account.currencyCode)
                                        : (stats.last30DaysNetTotal | czkCurrency)
                                }}
                            </div>
                        </div>
                    </div>

                    <span class="text-muted-color text-sm block">
                Příjmy/Výdaje:
                        {{
                            account
                                ? (stats.last30DaysNetFlow | currencyFormat: account.currencyCode)
                                : (stats.last30DaysNetFlow | czkCurrency)
                        }}
            </span>

                    <span class="text-muted-color text-sm">
                Výnosy/Náklady:
                        {{
                            account
                                ? (stats.last30DaysNetExpense | currencyFormat: account.currencyCode)
                                : (stats.last30DaysNetExpense | czkCurrency)
                        }}
            </span>
                </div>

                <!-- Příjmy vs. výdaje za 30 dní -->
                <div class="mb-2 pb-2 border-b border-surface-200 dark:border-surface-700">
                    <div class="flex justify-between mb-1">
                        <div>
                    <span class="block text-muted-color font-medium mb-1">
                        Příjmy vs. výdaje za posledních 30 dnů
                    </span>
                            <div
                                class="font-medium text-xl"
                                [ngClass]="getAmountClass(stats.last30DaysNetFlow)"
                            >
                                {{
                                    account
                                        ? (stats.last30DaysNetFlow | currencyFormat: account.currencyCode)
                                        : (stats.last30DaysNetFlow | czkCurrency)
                                }}
                            </div>
                        </div>
                    </div>

                    <span class="text-muted-color text-sm block">
                Příjmy:
                        {{
                            account
                                ? (stats.last30DaysTotalInflow | currencyFormat: account.currencyCode)
                                : (stats.last30DaysTotalInflow | czkCurrency)
                        }}
            </span>

                    <span class="text-muted-color text-sm">
                Výdaje:
                        {{
                            account
                                ? (stats.last30DaysTotalOutflow | currencyFormat: account.currencyCode)
                                : (stats.last30DaysTotalOutflow | czkCurrency)
                        }}
            </span>
                </div>

                <!-- Výnosy vs. náklady za 30 dní -->
                <div>
                    <div class="flex justify-between mb-1">
                        <div>
                    <span class="block text-muted-color font-medium mb-1">
                        Výnosy vs. náklady za posledních 30 dnů
                    </span>
                            <div
                                class="font-medium text-xl"
                                [ngClass]="getAmountClass(stats.last30DaysNetExpense)"
                            >
                                {{
                                    account
                                        ? (stats.last30DaysNetExpense | currencyFormat: account.currencyCode)
                                        : (stats.last30DaysNetExpense | czkCurrency)
                                }}
                            </div>
                        </div>
                    </div>

                    <span class="text-muted-color text-sm block">
                Náklady:
                        {{
                            account
                                ? (stats.last30DaysTotalExpense | currencyFormat: account.currencyCode)
                                : (stats.last30DaysTotalExpense | czkCurrency)
                        }}
            </span>

                    <span class="text-muted-color text-sm">
                Výnosy:
                        {{
                            account
                                ? (stats.last30DaysTotalRevenue | currencyFormat: account.currencyCode)
                                : (stats.last30DaysTotalRevenue | czkCurrency)
                        }}
            </span>
                </div>
            </div>
        </div>
    `
})
export class AccountStatsWidget implements OnChanges {
    @Input() account: Account | null = null;
    stats: AccountStatsResponse | null = null;
    loading = false;
    error = false;

    constructor(private accountService: AccountService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['account']) {
            this.loadStats();
        }
    }

    reload(): void {
        this.loadStats();
    }

    private loadStats(): void {
        this.loading = true;
        this.error = false;
        this.stats = null;

        this.accountService.getStats(this.account).subscribe({
            next: (data) => {
                this.stats = data;
                this.loading = false;
            },
            error: () => {
                this.error = true;
                this.loading = false;
            }
        });
    }

    getAmountClass(amount: number): string {
        if (amount >= 0) {
            return 'text-green-600 dark:text-green-400';
        } else {
            return 'text-red-600 dark:text-red-400';
        }
    }
}
