import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute } from '@angular/router';
import { MovementService, MovementResponse } from './movement.service';
import { Select } from 'primeng/select';
import { CzCurrencyPipe } from '@/pages/currency/formaters/cz-currency-formatter';
import { CzDateFormatter } from '@/pages/currency/formaters/cz-date-formatter';
import { Tag } from 'primeng/tag';

@Component({
    selector: 'app-account-crud',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, InputTextModule, InputNumberModule, ButtonModule, Select, CzCurrencyPipe, CzDateFormatter, Tag, TableModule],
    template: `
        <div class="card">
            <h2 class="mb-3">Movements</h2>

            <p-table [value]="movements" [lazy]="true" [lazyLoadOnInit]="true" [paginator]="true" [rows]="20" [totalRecords]="totalRecords" [loading]="loading" dataKey="id" editMode="row" (onLazyLoad)="loadMovements($event)">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Date</th>
                        <th>New</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-row>
                    <tr>
                        <!-- Date -->
                        <td>{{ row.date | czDateFormatter }}</td>

                        <!-- Is new movememnt -->
                        <td>
                            <p-tag *ngIf="row.isNew" severity="info" value="New"></p-tag>
                        </td>

                        <!-- Description -->
                        <td pEditableColumn>
                            <p-cellEditor>
                                <ng-template pTemplate="input">
                                    <input pInputText [(ngModel)]="row.description" (blur)="saveMovement(row)" (keydown.enter)="saveMovement(row)" />
                                </ng-template>
                                <ng-template pTemplate="output">
                                    {{ row.description }}
                                </ng-template>
                            </p-cellEditor>
                        </td>

                        <!-- Type -->
                        <td pEditableColumn>
                            <p-cellEditor>
                                <ng-template pTemplate="input">
                                    <p-select [options]="getMovementTypes(row)" [(ngModel)]="row.type" optionLabel="label" optionValue="value" (onChange)="saveMovement(row)"></p-select>
                                </ng-template>
                                <ng-template pTemplate="output">
                                    {{ row.type }}
                                </ng-template>
                            </p-cellEditor>
                        </td>

                        <!-- Amount -->
                        <td pEditableColumn>
                            <p-cellEditor>
                                <ng-template pTemplate="input">
                                    <p-inputNumber [(ngModel)]="row.amount" mode="decimal" [minFractionDigits]="2" (onBlur)="saveMovement(row)" (keydown.enter)="saveMovement(row)"></p-inputNumber>
                                </ng-template>
                                <ng-template pTemplate="output">
                                    <span [ngClass]="getAmountClass(row.type)">
                                        {{ row.amount | czCurrency }}
                                    </span>
                                </ng-template>
                            </p-cellEditor>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class AccountPage implements OnInit {
    movements: MovementResponse[] = [];
    totalRecords = 0;
    loading = true;

    accountId!: number;

    positiveMovementTypes = [
        { label: 'Revenue', value: 'REVENUE' },
        { label: 'Inflow', value: 'INFLOW' }
    ];

    negativeMovementTypes = [
        { label: 'Expense', value: 'EXPENSE' },
        { label: 'Outflow', value: 'OUTFLOW' }
    ];

    constructor(
        private movementService: MovementService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.accountId = Number(this.route.snapshot.paramMap.get('id'));
    }

    loadMovements(event: any) {
        const page = event.first / event.rows;
        const size = event.rows;

        this.movementService.getMovements(this.accountId, page, size).subscribe({
            next: (pageData) => {
                this.movements = pageData.content;
                this.totalRecords = pageData.totalElements;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    saveMovement(movement: MovementResponse) {
        movement.isNew = false;
        this.movementService.updateMovement(movement).subscribe();
    }

    getAmountClass(type: string): string {
        switch (type) {
            case 'REVENUE':
            case 'INFLOW':
                return 'text-green-600 dark:text-green-400';
            case 'EXPENSE':
            case 'OUTFLOW':
                return 'text-red-600 dark:text-red-400';
            default:
                return '';
        }
    }

    getMovementTypes(movement: MovementResponse): {
        label: string;
        value: string;
    }[] {
        if (movement.amount > 0) {
            return this.positiveMovementTypes;
        } else {
            return this.negativeMovementTypes;
        }
    }
}
