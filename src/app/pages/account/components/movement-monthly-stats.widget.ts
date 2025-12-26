import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { HttpClient } from '@angular/common/http';
import { ApiEndpoints } from '@/api/api-endpoints';
import { MovementMonthlyStatsResponse } from '@/pages/account/model/movement-monthly-stats.model';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-monthly-stats-pie',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, SelectModule],
    template: `
        <div class="card">
            <div class="flex flex-wrap items-end gap-4 mb-4">
                <div class="flex flex-col gap-1">
                    <label for="year" class="font-semibold">Rok</label>
                    <p-select
                        inputId="year"
                        [options]="years"
                        [(ngModel)]="selectedYear"
                        (onChange)="loadData()"
                        [showClear]="false"
                        [placeholder]="'Vyberte rok'"
                        [style]="{ minWidth: '10rem' }"
                    ></p-select>
                </div>

                <div class="flex flex-col gap-1">
                    <label for="month" class="font-semibold">Měsíc</label>
                    <p-select
                        inputId="month"
                        [options]="months"
                        optionLabel="label"
                        optionValue="value"
                        [(ngModel)]="selectedMonth"
                        (onChange)="loadData()"
                        [showClear]="false"
                        [placeholder]="'Vyberte měsíc'"
                        [style]="{ minWidth: '10rem' }"
                    ></p-select>
                </div>
            </div>

            <div *ngIf="loading" class="mt-4">Načítám data...</div>

            <div *ngIf="!loading" class="grid grid-cols-12 gap-6">
                <!-- Levý graf: Náklady -->
                <div class="col-span-12 xl:col-span-6">
                    <div class="card flex flex-col items-center">
                        <div class="font-semibold text-xl mb-4">Náklady</div>

                        <ng-container *ngIf="chartDataExpense?.labels?.length; else noExpense">
                            <p-chart type="doughnut" [data]="chartDataExpense" [options]="chartOptions"></p-chart>
                        </ng-container>

                        <ng-template #noExpense>
                            <span>Pro toto období nejsou k dispozici žádné náklady.</span>
                        </ng-template>
                    </div>
                </div>

                <!-- Pravý graf: Výnosy -->
                <div class="col-span-12 xl:col-span-6">
                    <div class="card flex flex-col items-center">
                        <div class="font-semibold text-xl mb-4">Výnosy</div>

                        <ng-container *ngIf="chartDataIncome?.labels?.length; else noIncome">
                            <p-chart type="doughnut" [data]="chartDataIncome" [options]="chartOptions"></p-chart>
                        </ng-container>

                        <ng-template #noIncome>
                            <span>Pro toto období nejsou k dispozici žádné výnosy.</span>
                        </ng-template>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class MonthlyStatsPieComponent implements OnInit {
    @Input() accountId!: number;

    years: number[] = [];
    months = [
        { value: 1, label: 'Leden' },
        { value: 2, label: 'Únor' },
        { value: 3, label: 'Březen' },
        { value: 4, label: 'Duben' },
        { value: 5, label: 'Květen' },
        { value: 6, label: 'Červen' },
        { value: 7, label: 'Červenec' },
        { value: 8, label: 'Srpen' },
        { value: 9, label: 'Září' },
        { value: 10, label: 'Říjen' },
        { value: 11, label: 'Listopad' },
        { value: 12, label: 'Prosinec' }
    ];

    selectedYear!: number;
    selectedMonth: number = new Date().getMonth() + 1;

    chartDataExpense: any;
    chartDataIncome: any;
    chartOptions: any;

    loading = false;

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        const currentYear = new Date().getFullYear();
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
        this.selectedYear = currentYear;

        this.initChartOptions();
        this.loadData();
    }

    loadData(): void {
        if (!this.accountId) {
            return;
        }

        this.loading = true;

        const expenseUrl = ApiEndpoints.Movement.monthlyWithParams(this.selectedYear, this.selectedMonth, 'EXPENSE', this.accountId);
        const incomeUrl = ApiEndpoints.Movement.monthlyWithParams(this.selectedYear, this.selectedMonth, 'REVENUE', this.accountId);

        // Načteme náklady a výnosy paralelně
        this.http.get<MovementMonthlyStatsResponse[]>(expenseUrl).subscribe({
            next: (expenseData) => {
                this.chartDataExpense = this.buildChartData(expenseData);

                this.http.get<MovementMonthlyStatsResponse[]>(incomeUrl).subscribe({
                    next: (incomeData) => {
                        this.chartDataIncome = this.buildChartData(incomeData);
                        this.loading = false;
                    },
                    error: () => {
                        this.chartDataIncome = this.buildChartData([]);
                        this.loading = false;
                    }
                });
            },
            error: () => {
                this.chartDataExpense = this.buildChartData([]);
                this.chartDataIncome = this.buildChartData([]);
                this.loading = false;
            }
        });
    }

    private buildChartData(data: MovementMonthlyStatsResponse[]): any {
        const documentStyle = getComputedStyle(document.documentElement);

        const labels = data.map((item) => item.tagName ?? 'Bez štítku');
        const values = data.map((item) => item.totalAmount);

        const baseColors = [
            documentStyle.getPropertyValue('--p-indigo-500'),
            documentStyle.getPropertyValue('--p-purple-500'),
            documentStyle.getPropertyValue('--p-teal-500'),
            documentStyle.getPropertyValue('--p-orange-500'),
            documentStyle.getPropertyValue('--p-cyan-500'),
            documentStyle.getPropertyValue('--p-pink-500')
        ];
        const hoverColors = [
            documentStyle.getPropertyValue('--p-indigo-400'),
            documentStyle.getPropertyValue('--p-purple-400'),
            documentStyle.getPropertyValue('--p-teal-400'),
            documentStyle.getPropertyValue('--p-orange-400'),
            documentStyle.getPropertyValue('--p-cyan-400'),
            documentStyle.getPropertyValue('--p-pink-400')
        ];

        return {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: labels.map((_, idx) => baseColors[idx % baseColors.length]),
                    hoverBackgroundColor: labels.map((_, idx) => hoverColors[idx % hoverColors.length])
                }
            ]
        };
    }

    private initChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color-secondary');


        this.chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    },
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem: any) => {
                            const value = tooltipItem.raw;
                            const total = tooltipItem.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                            const percent = total ? ((value / total) * 100).toFixed(1) : '0';
                            return `${tooltipItem.label}: ${value} (${percent} %)`;
                        }
                    }
                }
            }
        };
    }
}

