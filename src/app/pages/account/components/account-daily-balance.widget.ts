// daily-balance-chart.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Subscription } from 'rxjs';
import { DailyAccountStat } from '@/pages/account/model/account-daily-stats.model';
import { AccountService } from '@/pages/account/account.service';

@Component({
    selector: 'app-daily-balance-chart',
    standalone: true,
    imports: [CommonModule, ChartModule],
    template: `
        <div class="card h-full">
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-xl">Denní bilance účtu</div>
            </div>

            <ng-container *ngIf="!loading && error" >
                <div class="text-red-500 text-sm">
                    Nepodařilo se načíst data grafu.
                </div>
            </ng-container>

            <ng-container *ngIf="loading">
                <div class="text-sm text-surface-500">
                    Načítám data...
                </div>
            </ng-container>

            <ng-container *ngIf="!loading && !error && chartData">
                <p-chart
                    type="line"
                    [data]="chartData"
                    [options]="chartOptions"
                    style="width: 100%; min-height: 260px"
                ></p-chart>
            </ng-container>
        </div>
    `
})
export class DailyBalanceChartComponent implements OnChanges, OnDestroy {
    @Input() accountId: number | null = null;

    chartData: any;
    chartOptions: any;

    loading = false;
    error = false;

    private sub?: Subscription;

    constructor(private accountService: AccountService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['accountId'] && this.accountId != null) {
            this.loadData();
        }
    }

    private loadData(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        if (this.accountId == null) {
            return;
        }

        this.loading = true;
        this.error = false;

        this.sub = this.accountService.getDailyBalance(this.accountId).subscribe({
            next: (data) => {
                this.loading = false;
                this.buildChart(data);
            },
            error: () => {
                this.loading = false;
                this.error = true;
            }
        });
    }

    private buildChart(data: DailyAccountStat[]): void {
        // Seřadit podle datumu (pro jistotu)
        const sorted = [...data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const primaryColor = documentStyle.getPropertyValue('--p-primary-500');

        const labels = sorted.map((d) => d.date); // případně zde formátovat datum
        const balances = sorted.map((d) => d.balance);

        this.chartData = {
            labels,
            datasets: [
                {
                    label: 'Bilance (CZK)', // nebo měnu dle potřeby
                    data: balances,
                    fill: false,
                    borderColor: primaryColor,
                    backgroundColor: primaryColor,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const value = context.parsed.y;
                            return `Bilance: ${value.toLocaleString('cs-CZ', {
                                style: 'currency',
                                currency: 'CZK'
                            })}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        callback: (value: number) =>
                            value.toLocaleString('cs-CZ', {
                                style: 'currency',
                                currency: 'CZK',
                                maximumFractionDigits: 0
                            })
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
