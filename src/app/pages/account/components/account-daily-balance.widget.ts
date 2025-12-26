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

        const green = documentStyle.getPropertyValue('--p-green-500') || '#22c55e';
        const red = documentStyle.getPropertyValue('--p-red-500') || '#ef4444';
        const neutral = documentStyle.getPropertyValue('--p-primary-400') || '#60a5fa';

        const labels = sorted.map((d) => d.date);
        const balances = sorted.map((d) => d.balance);

        // Jemný gradient pro vyplnění pod křivkou (základní barva neutrální)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let gradientFill: CanvasGradient | undefined;
        if (ctx) {
            gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
            gradientFill.addColorStop(0, neutral + 'CC'); // nahoře trochu průhledné
            gradientFill.addColorStop(1, neutral + '00'); // dole úplně průhledné
        }

        this.chartData = {
            labels,
            datasets: [
                {
                    label: 'Bilance',
                    data: balances,
                    borderWidth: 2,
                    // fallback barvy (když segment callback nepoběží)
                    borderColor: neutral,
                    backgroundColor: gradientFill ?? neutral + '33',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: neutral,
                    pointBorderWidth: 0,
                    hitRadius: 10,
                    // Dynamické barvy jednotlivých úseků (segmentů)
                    segment: {
                        borderColor: (ctx: any) => {
                            const p0 = ctx.p0?.parsed?.y;
                            const p1 = ctx.p1?.parsed?.y;
                            if (p0 == null || p1 == null) {
                                return neutral;
                            }
                            if (p1 > p0) {
                                return green; // roste
                            }
                            if (p1 < p0) {
                                return red; // klesá
                            }
                            return neutral; // beze změny
                        },
                        backgroundColor: (ctx: any) => {
                            // lehčí barva do výplně podle směru
                            const p0 = ctx.p0?.parsed?.y;
                            const p1 = ctx.p1?.parsed?.y;
                            if (p0 == null || p1 == null) {
                                return gradientFill ?? neutral + '22';
                            }
                            if (p1 > p0) {
                                return green + '22';
                            }
                            if (p1 < p0) {
                                return red + '22';
                            }
                            return neutral + '22';
                        }
                    }
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        title: (items: any[]) => {
                            const rawDate = items[0]?.label;
                            if (!rawDate) {
                                return '';
                            }
                            const d = new Date(rawDate);
                            return d.toLocaleDateString('cs-CZ', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                        },
                        label: (context: any) => {
                            const value = context.parsed.y;
                            return value.toLocaleString('cs-CZ', {
                                style: 'currency',
                                currency: 'CZK'
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        maxRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 10,
                        callback: (value: any, index: number) => {
                            const rawDate = labels[index];
                            const d = new Date(rawDate);
                            // kratší formát pro osu
                            return d.toLocaleDateString('cs-CZ', {
                                day: '2-digit',
                                month: '2-digit'
                            });
                        }
                    },
                    grid: {
                        display: true,      // ← zpět zapnuté kolmé čáry
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
                        borderDash: [4, 4],   // jemně čárkovaná mřížka
                        drawBorder: false
                    }
                }
            },
            // zvýraznění nuly (pokud pracuješ se silně zápornými/kladnými hodnotami)
            elements: {
                line: {
                    borderWidth: 2
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
