import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MovementTableComponent } from './components/movement-table.component';
import { AccountStatsWidget } from '@/pages/account/components/account-stats.widget';

@Component({
    selector: 'app-account-crud',
    standalone: true,
    imports: [CommonModule, MovementTableComponent, AccountStatsWidget],
    template: `
        <div class="card">
            <h2 class="mb-3">Přehled účtu</h2>

            <app-stats-widget *ngIf="accountId !== null" [accountId]="accountId!"></app-stats-widget>
        </div>

        <div class="card mt-4">
            <h2 class="mb-3">Movements</h2>

            <app-movement-table *ngIf="accountId !== null" [accountId]="accountId!" (movementsChanged)="onMovementsChanged()" )></app-movement-table>
        </div>
    `
})
export class AccountPage implements OnInit {
    accountId: number | null = null;

    @ViewChild(AccountStatsWidget)
    statsWidget?: AccountStatsWidget;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    }

    onMovementsChanged(): void {
        this.statsWidget?.reload();
    }
}
