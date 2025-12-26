import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MovementService } from '@/pages/account/movement.service';
import { MovementMonthlyStatsResponse } from '@/pages/account/model/movement-monthly-stats.model';

@Component({
    selector: 'app-monthly-stats-pie',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule],
    template: `
        <div class="card flex flex-col gap-4">
            <div class="flex flex-wrap gap-4 items-end">
                <!-- Rok -->
                <div class="flex flex-col gap-1">
                    <label for="year" class="font-semibold">Rok</label>
                    <select
                        id="year"
                        class="p-inputtext p-component"
                        [(ngModel)]="selectedYear"
                        (change)="loadData()"
                    >
                        <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                    </select>
                </div>

                <!-- Měsíc -->
                <div class="flex flex-col gap-1">
                    <label for="month" class="font-semibold">Měsíc</label>
                    <select
                        id="month"
                        class="p-inputtext p-component"
                        [(ngModel)]="selectedMonth"
                        (change)="loadData()"
                    >
                        <option *ngFor="let m of months" [value]="m.value">
                            {{ m.label }}
                        </option>
                    </select>
                </div>

                <!-- Typ pohybu -->
                <div class="flex flex-col gap-1">
                    <label for="type" class="font-semibold">Typ</label>
                    <select
                        id="type"
                        class="p-inputtext p-component"
                        [(ngModel)]="selectedType"
                        (change)="loadData()"
                    >
                        <option value="EXPENSE">Náklady</option>
                        <option value="REVENUE">Výnosy</option>
                    </select>
                </div>

                <!-- Volitelně účet -->
                <div class="flex flex-col gap-1" *ngIf="showAccountSelect">
                    <label for="accountId" class="font-semibold">Účet</label>
                    <input
                        id="accountId"
                        type="number"
                        class="p-inputtext p-component"
                        [(ngModel)]="accountId"
                        (change)="loadData()"
                        placeholder="ID účtu"
                    />
                </div>
            </div>

            <div *ngIf="loading" class="mt-4">
                Načítám data...
            </div>

            <div *ngIf="!loading && (!chartData || !chartData.labels?.length)" class="mt-4">
                Pro vybrané období nejsou k dispozici žádná data.
            </div>

            <div *ngIf="!loading && chartData && chartData.labels?.length">
                <p-chart type="pie" [data]="chartData" [options]="chartOptions"></p-chart>
            </div>
        </div>
    `
})
export class MonthlyStatsPieComponent implements OnInit {
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
    selectedMonth: number = new Date().getMonth() + 1; // 1–12
    selectedType: string = 'EXPENSE';
    accountId?: number;

    showAccountSelect = false; // nastavte na true, pokud chcete vybírat účet

    loading = false;

    chartData: any;
    chartOptions: any;

    constructor(private statsService: MovementService) {}

    ngOnInit(): void {
        const currentYear = new Date().getFullYear();
        // např. posledních 5 let
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
        this.selectedYear = currentYear;

        this.initChartOptions();
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.statsService
            .getMonthlyStats(this.selectedYear, this.selectedMonth, this.selectedType, this.accountId)
            .subscribe({
                next: (data) => {
                    this.buildChartData(data);
                    this.loading = false;
                },
                error: () => {
                    this.chartData = null;
                    this.loading = false;
                }
            });
    }

    private buildChartData(data: MovementMonthlyStatsResponse[]): void {
        const documentStyle = getComputedStyle(document.documentElement);

        const labels = data.map((item) => item.tagName ?? 'Bez štítku');
        const values = data.map((item) => item.totalAmount);

        // Použijeme stejné barevné proměnné jako v ChartDemo (pieData)
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

        this.chartData = {
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
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    },
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        // zobrazíme i procenta spočítaná z hodnot (jako doplněk k částce)
                        label: (tooltipItem: any) => {
                            const value = tooltipItem.raw;
                            const total = tooltipItem.dataset.data.reduce(
                                (sum: number, val: number) => sum + val,
                                0
                            );
                            const percent = total ? ((value / total) * 100).toFixed(1) : '0';
                            return `${tooltipItem.label}: ${value} (${percent} %)`;
                        }
                    }
                }
            }
        };
    }
}
