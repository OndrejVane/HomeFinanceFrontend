import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountStatsResponse } from '@/pages/account/model/account-stats.model';
import { AccountService } from '@/pages/account/account.service';
import { CzDateFormatter } from '@/pages/currency/formaters/cz-date-formatter';


@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, CzDateFormatter],
    template: `
        <div *ngIf="loading" class="mb-3">Načítání statistik...</div>

        <div *ngIf="error" class="mb-3 text-red-500">Nepodařilo se načíst statistiky účtu.</div>

        <div *ngIf="stats" class="grid grid-cols-12 gap-4 mb-4">
            <!-- Aktuální stav účtu -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-2">
                        <div>
                            <span class="block text-muted-color font-medium mb-2"> Aktuální zůstatek </span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                                {{ stats.currentBalance | number: '1.2-2' }}
                            </div>
                        </div>
                    </div>
                    <span class="text-muted-color text-sm"> Počáteční zůstatek: {{ stats.initialBalance | number: '1.2-2' }} </span>
                </div>
            </div>

            <!-- Celkový tok -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-2">
                        <div>
                            <span class="block text-muted-color font-medium mb-2"> Celkový tok </span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                                {{ stats.netFlow | number: '1.2-2' }}
                            </div>
                        </div>
                    </div>
                    <span class="text-muted-color text-sm block"> Příjmy: {{ stats.totalInflow | number: '1.2-2' }} </span>
                    <span class="text-muted-color text-sm"> Výdaje: {{ stats.totalOutflow | number: '1.2-2' }} </span>
                </div>
            </div>

            <!-- Čisté náklady (celkem) -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-2">
                        <div>
                            <span class="block text-muted-color font-medium mb-2"> Čisté náklady </span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                                {{ stats.netExpense | number: '1.2-2' }}
                            </div>
                        </div>
                    </div>
                    <span class="text-muted-color text-sm block"> Náklady: {{ stats.totalExpense | number: '1.2-2' }} </span>
                    <span class="text-muted-color text-sm"> Výnosy: {{ stats.totalRevenue | number: '1.2-2' }} </span>
                </div>
            </div>

            <!-- Posledních 30 dní + počet pohybů -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-2">
                        <div>
                            <span class="block text-muted-color font-medium mb-2"> Posledních 30 dní </span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                                {{ stats.last30DaysNetFlow | number: '1.2-2' }}
                            </div>
                        </div>
                    </div>
                    <span class="text-muted-color text-sm block"> Příjmy: {{ stats.last30DaysTotalInflow | number: '1.2-2' }} </span>
                    <span class="text-muted-color text-sm block"> Výdaje: {{ stats.last30DaysTotalOutflow | number: '1.2-2' }} </span>
                    <span class="text-muted-color text-sm block mt-2"> Počet pohybů: {{ stats.movementsCount }} </span>
                    <span class="text-muted-color text-sm" *ngIf="stats.lastMovementDate"> Poslední pohyb: {{ stats.lastMovementDate | czDateFormatter }} </span>
                </div>
            </div>
        </div>
    `
})
export class AccountStatsWidget implements OnChanges {
    @Input() accountId!: number;

    stats: AccountStatsResponse | null = null;
    loading = false;
    error = false;

    constructor(private accountService: AccountService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['accountId'] && this.accountId != null) {
            this.loadStats();
        }
    }

    reload(): void {
        if (this.accountId != null) {
            this.loadStats();
        }
    }

    private loadStats(): void {
        this.loading = true;
        this.error = false;
        this.stats = null;

        this.accountService.getStats(this.accountId).subscribe({
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
}
