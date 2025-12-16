import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Currency } from './currency.model';
import { CurrencyService } from './currency.service';

@Component({
    selector: 'app-currency-crud',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToolbarModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <h3>Currency</h3>
        <p-toolbar class="mb-4">
            <ng-template #start>
                <p-button label="New" icon="pi pi-plus" (click)="openNew()" disabled/>
                <p-button
                    label="Delete"
                    icon="pi pi-trash"
                    severity="danger"
                    class="ml-2"
                    disabled
                />
            </ng-template>

            <ng-template #end>
                <input
                    pInputText
                    type="text"
                    placeholder="Search..."
                    (input)="onGlobalFilter(dt, $event)"
                />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="currencies()"
            [(selection)]="selectedCurrencies"
            dataKey="id"
            [paginator]="true"
            [rows]="10"
            [rowHover]="true"
            [globalFilterFields]="['code','name']"
        >
            <ng-template #header>
                <tr>
                    <th style="width:3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th pSortableColumn="code">
                        Code
                        <p-sortIcon field="code" />
                    </th>
                    <th pSortableColumn="name">
                        Name
                        <p-sortIcon field="name" />
                    </th>
                    <th style="width:8rem"></th>
                </tr>
            </ng-template>

            <ng-template #body let-currency>
                <tr>
                    <td>
                        <p-tableCheckbox [value]="currency" />
                    </td>
                    <td>{{ currency.code }}</td>
                    <td>{{ currency.name }}</td>
                    <td>
                        <p-button
                            icon="pi pi-eye"
                            [outlined]="true"
                            (click)="editCurrency(currency)"
                        />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog
            [(visible)]="currencyDialog"
            header="Currency"
            [modal]="true"
            [style]="{ width: '400px' }"
        >
            <div class="flex flex-col gap-3">
                <div>
                    <label class="font-bold block mb-1">Code</label>
                    <input pInputText [(ngModel)]="currency.code" maxlength="3" readonly/>
                </div>

                <div>
                    <label class="font-bold block mb-1">Name</label>
                    <input pInputText [(ngModel)]="currency.name" readonly/>
                </div>
            </div>

            <ng-template #footer>
                <p-button label="Cancel" text (click)="hideDialog()" />
            </ng-template>
        </p-dialog>
        <p-toast />
    `
})
export class CurrencyPage implements OnInit {

    currencies = signal<Currency[]>([]);
    selectedCurrencies: Currency[] | null = null;

    currencyDialog = false;
    submitted = false;

    currency: Currency = { code: '', name: '' };

    @ViewChild('dt') dt!: Table;

    constructor(
        private currencyService: CurrencyService,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.loadCurrencies();
    }

    loadCurrencies() {
        this.currencyService.getCurrencies().subscribe({
            next: data => this.currencies.set(data),
            error: () => this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load currencies'
            })
        });
    }

    openNew() {
        this.currency = { code: '', name: '' };
        this.submitted = false;
        this.currencyDialog = true;
    }

    editCurrency(currency: Currency) {
        this.currency = { ...currency };
        this.currencyDialog = true;
    }

    hideDialog() {
        this.currencyDialog = false;
        this.submitted = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }
}
