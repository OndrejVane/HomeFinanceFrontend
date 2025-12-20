import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MovementService, MovementResponse } from '../movement.service';
import { CzCurrencyPipe } from '@/pages/currency/formaters/cz-currency-formatter';
import { CzDateFormatter } from '@/pages/currency/formaters/cz-date-formatter';

@Component({
    selector: 'app-movement-table',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        InputTextModule,
        InputNumberModule,
        ButtonModule,
        Select,
        CzCurrencyPipe,
        CzDateFormatter,
        Tag,
        ConfirmDialogModule,
        TranslateModule
    ],
    providers: [ConfirmationService],
    template: `
        <p-table
            [value]="movements"
            [lazy]="true"
            [lazyLoadOnInit]="true"
            [paginator]="true"
            [rows]="20"
            [totalRecords]="totalRecords"
            [loading]="loading"
            dataKey="id"
            editMode="row"
            (onLazyLoad)="loadMovements($event)"
        >
            <ng-template pTemplate="header">
                <tr>
                    <th>Date</th>
                    <th>New</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row>
                <tr>
                    <!-- Date -->
                    <td>{{ row.date | czDateFormatter }}</td>

                    <!-- Is new movement -->
                    <td>
                        <p-tag *ngIf="row.imported" severity="info" value="New"></p-tag>
                    </td>

                    <!-- Description -->
                    <td pEditableColumn>
                        <p-cellEditor>
                            <ng-template pTemplate="input">
                                <input
                                    pInputText
                                    [(ngModel)]="row.description"
                                    (blur)="saveMovement(row)"
                                    (keydown.enter)="saveMovement(row)"
                                />
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
                                <p-select
                                    [options]="getMovementTypes(row)"
                                    [(ngModel)]="row.type"
                                    optionLabel="label"
                                    optionValue="value"
                                    (onChange)="saveMovement(row)"
                                ></p-select>
                            </ng-template>
                            <ng-template pTemplate="output">
                                {{ getTranslatedMovementType(row) }}
                            </ng-template>
                        </p-cellEditor>
                    </td>

                    <!-- Amount -->
                    <td pEditableColumn>
                        <p-cellEditor>
                            <ng-template pTemplate="input">
                                <p-inputNumber
                                    [(ngModel)]="row.amount"
                                    mode="decimal"
                                    [minFractionDigits]="2"
                                    (onBlur)="saveMovement(row)"
                                    (keydown.enter)="saveMovement(row)"
                                ></p-inputNumber>
                            </ng-template>
                            <ng-template pTemplate="output">
                                <span [ngClass]="getAmountClass(row.type)">
                                    {{ row.amount | czCurrency }}
                                </span>
                            </ng-template>
                        </p-cellEditor>
                    </td>

                    <!-- Actions -->
                    <td class="text-center">
                        <p-button
                            (click)="confirmDelete(row)"
                            icon="pi pi-times"
                            severity="danger"
                            text
                            raised
                            rounded
                        ></p-button>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Globální potvrzovací dialog -->
        <p-confirmDialog></p-confirmDialog>
    `
})
export class MovementTableComponent implements OnInit {
    @Input({ required: true }) accountId!: number;
    @Output() movementsChanged = new EventEmitter<void>();

    movements: MovementResponse[] = [];
    totalRecords = 0;
    loading = true;

    positiveMovementTypes: { label: string; value: string }[] = [];
    negativeMovementTypes: { label: string; value: string }[] = [];

    constructor(
        private movementService: MovementService,
        private confirmationService: ConfirmationService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.translate.get(['expense', 'outflow', 'revenue', 'inflow']).subscribe((t) => {
            this.negativeMovementTypes = [
                { label: t['expense'], value: 'EXPENSE' },
                { label: t['outflow'], value: 'OUTFLOW' }
            ];

            this.positiveMovementTypes = [
                { label: t['revenue'], value: 'REVENUE' },
                { label: t['inflow'], value: 'INFLOW' }
            ];
        });
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
        movement.imported = false;
        this.movementService.updateMovement(movement).subscribe({
            next: () => {
                this.movementsChanged.emit();
            }
        });
    }

    confirmDelete(movement: MovementResponse) {
        this.confirmationService.confirm({
            message: this.translate.instant('areYouSureToDelete'),
            header: this.translate.instant('confirmation'),
            defaultFocus: 'accept',
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: this.translate.instant('no'),
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-text p-button-secondary',
            acceptLabel: this.translate.instant('yes'),
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-outlined p-button-danger',
            accept: () => this.deleteMovement(movement)
        });
    }

    private deleteMovement(movement: MovementResponse) {
        if (!movement.id) {
            return;
        }

        this.movementService.deleteMovement(movement.id).subscribe({
            next: () => {
                this.movements = this.movements.filter((m) => m.id !== movement.id);
                this.totalRecords = this.totalRecords - 1;
                this.movementsChanged.emit();
            }
        });
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

    getMovementTypes(movement: MovementResponse): { label: string; value: string }[] {
        if (movement.amount > 0) {
            return this.positiveMovementTypes;
        } else {
            return this.negativeMovementTypes;
        }
    }

    getTranslatedMovementType(movement: MovementResponse): string {
        return this.translate.instant(movement.type.toLowerCase());
    }
}
