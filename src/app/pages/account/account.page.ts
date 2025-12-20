import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MovementTableComponent } from './components/movement-table.component';
import { AccountStatsWidget } from '@/pages/account/components/account-stats.widget';
import { AccountService } from '@/pages/account/account.service';
import { Account } from '@/pages/account/account.model';

@Component({
    selector: 'app-account-crud',
    standalone: true,
    imports: [CommonModule, MovementTableComponent, AccountStatsWidget],
    template: `
        <div class="card">
            <!-- Hlavička rozbalovací karty -->
            <div class="flex items-center justify-between cursor-pointer mb-3" (click)="statsCollapsed = !statsCollapsed">
                <h2 class="mb-3">{{ account?.name }}</h2>
                <i class="pi" [ngClass]="statsCollapsed ? 'pi-chevron-down' : 'pi-chevron-up'"></i>
            </div>

            <!-- Tělo karty – celý komponent se statistikami -->
            <div *ngIf="!statsCollapsed">
                <app-stats-widget *ngIf="accountId !== null" [accountId]="accountId!"></app-stats-widget>
            </div>
        </div>

        <div class="card mt-4">
            <h2 class="mb-3">Pohyby</h2>

            <app-movement-table *ngIf="accountId !== null" [accountId]="accountId!" (movementsChanged)="onMovementsChanged()"></app-movement-table>
        </div>
    `
})
export class AccountPage implements OnInit {
    accountId: number | null = null;

    @ViewChild(AccountStatsWidget)
    statsWidget?: AccountStatsWidget;
    account: Account | null = null;

    // stav rozbalení celé karty se statistikami
    statsCollapsed = false;

    constructor(
        private route: ActivatedRoute,
        private accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.accountId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadAccount();
    }

    private loadAccount(): void {
        if (this.accountId != null) {
            this.accountService.getById(this.accountId).subscribe({
                next: (data) => {
                    this.account = data;
                }
            });
        }
    }

    onMovementsChanged(): void {
        this.statsWidget?.reload();
    }
}
