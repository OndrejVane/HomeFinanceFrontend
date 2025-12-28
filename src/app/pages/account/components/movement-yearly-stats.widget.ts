import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';
import { MovementYearlyStats } from '../model/movement-yearly-stats.model';
import { MovementService } from '@/pages/account/movement.service';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

interface YearOption {
    label: string;
    value: number;
}

@Component({
    selector: 'app-movement-yearly-stats',
    standalone: true,
    imports: [CommonModule, ChartModule, SelectModule, FormsModule, ProgressSpinnerModule],
    template: `
        <div class="card h-full flex flex-col">
            <div class="flex items-center justify-between mb-4 gap-3">
                <div class="font-semibold text-lg">
                    Roční přehled výnosů a nákladů
                </div>

                <div class="flex items-center gap-2">
                    <label for="yearSelect" class="text-sm font-medium">Rok:</label>
                    <p-select
                        id="yearSelect"
                        [(ngModel)]="selectedYear"
                        [options]="yearOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-32"
                        (onChange)="onYearChange()"
                    ></p-select>
                </div>
            </div>

            <div class="flex-1 min-h-[260px] relative">
                <ng-container *ngIf="!loading && yearlyData?.length; else loadingOrEmpty">
                    <p-chart
                        type="bar"
                        [data]="barData"
                        [options]="barOptions"
                    ></p-chart>
                </ng-container>

                <ng-template #loadingOrEmpty>
                    <div class="flex items-center justify-center h-72">
                        <ng-container *ngIf="loading; else emptyState">
                            <p-progressSpinner strokeWidth="4"></p-progressSpinner>
                        </ng-container>
                        <ng-template #emptyState>
                            <span class="text-sm text-muted-color">Žádná data k zobrazení</span>
                        </ng-template>
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class MovementYearlyStatsWidget implements OnInit, OnDestroy {
    @Input() accountId: number | null = null;

    yearOptions: YearOption[] = [];
    selectedYear!: number;

    yearlyData: MovementYearlyStats[] = [];
    loading = false;

    barData: any;
    barOptions: any;

    private layoutSub?: Subscription;

    constructor(
        private movementService: MovementService,
        private layoutService: LayoutService
    ) {}

    ngOnInit(): void {
        this.initYearOptions();
        this.initChartOptions();

        this.layoutSub = this.layoutService.configUpdate$.subscribe(() => {
            this.initChartOptions();
            this.updateBarData();
        });

        this.loadData();
    }

    ngOnDestroy(): void {
        this.layoutSub?.unsubscribe();
    }

    onYearChange(): void {
        this.loadData();
    }

    private initYearOptions(): void {
        const currentYear = new Date().getFullYear();
        const years: number[] = [];

        // například posledních 5 let + aktuální
        for (let y = currentYear; y >= currentYear - 5; y--) {
            years.push(y);
        }

        this.yearOptions = years.map((y) => ({ label: y.toString(), value: y }));
        this.selectedYear = this.selectedYear ?? currentYear;
    }

    private loadData(): void {
        if (!this.selectedYear) {
            this.initYearOptions();
        }

        this.loading = true;
        this.movementService.getYearlyStats(this.selectedYear, this.accountId).subscribe({
            next: (data) => {
                // backend vrací vždy 12 objektů – pro jistotu seřadíme podle měsíce
                this.yearlyData = [...data].sort((a, b) => a.month - b.month);
                this.updateBarData();
                this.loading = false;
            },
            error: () => {
                this.yearlyData = [];
                this.updateBarData();
                this.loading = false;
            }
        });
    }

    private updateBarData(): void {
        const documentStyle = getComputedStyle(document.documentElement);

        const labels = this.yearlyData.length
            ? this.yearlyData.map((m) => this.getMonthLabel(m.month))
            : Array.from({ length: 12 }, (_, i) => this.getMonthLabel(i + 1));

        const expenses = this.yearlyData.map((m) => m.expense ?? 0);
        const revenues = this.yearlyData.map((m) => m.revenue ?? 0);

        this.barData = {
            labels,
            datasets: [
                {
                    label: 'Výnosy',
                    backgroundColor: documentStyle.getPropertyValue('--p-green-500') || '#22c55e',
                    borderColor: documentStyle.getPropertyValue('--p-green-500') || '#22c55e',
                    data: revenues
                },
                {
                    label: 'Náklady',
                    backgroundColor: documentStyle.getPropertyValue('--p-red-500') || '#ef4444',
                    borderColor: documentStyle.getPropertyValue('--p-red-500') || '#ef4444',
                    data: expenses
                }
            ]
        };
    }

    private initChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y ?? 0;
                            return `${label}: ${value.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kč`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    stacked: false,
                    ticks: {
                        color: textColorSecondary,
                        callback: (value: any) =>
                            Number(value).toLocaleString('cs-CZ', { maximumFractionDigits: 0 })
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    private getMonthLabel(month: number): string {
        const labels = [
            'Leden',
            'Únor',
            'Březen',
            'Duben',
            'Květen',
            'Červen',
            'Červenec',
            'Srpen',
            'Září',
            'Říjen',
            'Listopad',
            'Prosinec'
        ];
        return labels[month - 1] ?? month.toString();
    }
}
