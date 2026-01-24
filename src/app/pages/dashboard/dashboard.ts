import { Component, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AccountImportBasicComponent } from '@/pages/account/components/movement-import-basic.component';
import { AccountStatsWidget } from '@/pages/account/components/account-stats.widget';
import { DailyBalanceChartComponent } from '@/pages/account/components/account-daily-balance.widget';
import { MonthlyStatsPieComponent } from '@/pages/account/components/movement-monthly-stats.widget';
import { MovementBalanceAdjustWidget } from '@/pages/account/components/movement-balance-adjust.widget';
import { MovementCreateWidget } from '@/pages/account/components/movement-create.widget';
import { MovementTableComponent } from '@/pages/account/components/movement-table.component';
import { MovementYearlyStatsWidget } from '@/pages/account/components/movement-yearly-stats.widget';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    imports: [DailyBalanceChartComponent, MovementYearlyStatsWidget, AccountStatsWidget, MonthlyStatsPieComponent],
    template: `
        <div class="card">
            <!-- Tělo karty – celý komponent se statistikami -->
            <div>
                <app-stats-widget [account]="null"></app-stats-widget>
            </div>

            <!-- Měsíční koláčové grafy: vlevo náklady, vpravo výnosy -->
            <app-monthly-stats-pie [accountId]="null"></app-monthly-stats-pie>

            <app-daily-balance-chart [accountId]="null"></app-daily-balance-chart>

            <app-movement-yearly-stats [accountId]="null"></app-movement-yearly-stats>
        </div>
    `
})
export class Dashboard implements OnInit {
    constructor() {}
    ngOnInit(): void {}
}
