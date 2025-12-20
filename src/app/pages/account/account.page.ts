import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MovementTableComponent } from './components/movement-table.component';

@Component({
    selector: 'app-account-crud',
    standalone: true,
    imports: [CommonModule, MovementTableComponent],
    template: `
        <div class="card">
            <h2 class="mb-3">Movements</h2>

            <app-movement-table *ngIf="accountId !== null" [accountId]="accountId!"></app-movement-table>
        </div>
    `
})
export class AccountPage implements OnInit {
    accountId: number | null = null;

    constructor(private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    }
}
