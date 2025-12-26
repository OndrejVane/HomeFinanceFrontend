import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MovementTableComponent } from './components/movement-table.component';
import { AccountStatsWidget } from '@/pages/account/components/account-stats.widget';
import { AccountService } from '@/pages/account/account.service';
import { Account } from '@/pages/account/account.model';
import { AccountImportBasicComponent } from '@/pages/account/components/movement-import-basic.component';
import { MonthlyStatsPieComponent } from '@/pages/account/components/movement-monthly-stats.widget';

@Component({
    selector: 'app-account-crud',
    standalone: true,
    imports: [CommonModule, MovementTableComponent, AccountStatsWidget, AccountImportBasicComponent, MonthlyStatsPieComponent],
    template: `
        <div class="card">
            <!-- Hlavička rozbalovací karty -->
            <div class="flex items-center justify-between mb-3">
                <!-- LEVÁ ČÁST – název účtu -->
                <h2 class="mb-0">
                    {{ account?.name }}
                </h2>

                <!-- PRAVÁ ČÁST – tlačítko + rozbalení -->
                <div class="flex items-center gap-2">
                    <button type="button" class="p-button p-component p-button-sm" (click)="toggleImport($event)">
                        <span class="p-button-label">Import pohybů</span>
                    </button>

                    <i class="pi cursor-pointer text-xl" [ngClass]="statsCollapsed ? 'pi-chevron-down' : 'pi-chevron-up'" (click)="statsCollapsed = !statsCollapsed"></i>
                </div>
            </div>

            <!-- Panel s importem pohybů -->
            <app-account-import-basic *ngIf="accountId !== null && showImport" [accountId]="accountId!" (completed)="onMovementsChanged()"></app-account-import-basic>

            <!-- Tělo karty – celý komponent se statistikami -->
            <div *ngIf="!statsCollapsed">
                <app-stats-widget *ngIf="accountId !== null" [accountId]="accountId!"></app-stats-widget>
            </div>

            <app-monthly-stats-pie></app-monthly-stats-pie>
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

    // stav zobrazení panelu pro import pohybů
    showImport = false;

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

    toggleImport(event: MouseEvent): void {
        // ochrana pro případ, že by tlačítko někdy bylo uvnitř klikací hlavičky
        event.stopPropagation();
        this.showImport = !this.showImport;
    }

    onMovementsChanged(): void {
        this.statsWidget?.reload();
    }
}
