import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MovementService } from '@/pages/account/movement.service';
import { MovementCreateRequest } from '@/pages/account/model/movement-request.model';
import { MovementType } from '@/pages/account/model/movement-type.enum';

@Component({
    selector: 'app-movement-balance-adjust',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DialogModule, Select, ToastModule],
    providers: [MessageService],
    template: `
        <div>
            <p-button
                label="Adjust balance"
                icon="pi pi-sliders-h"
                (onClick)="showDialog()"
            ></p-button>

            <p-dialog
                header="Adjust balance"
                [(visible)]="displayDialog"
                [modal]="true"
                [closable]="true"
                [style]="{ width: '480px' }"
            >
                <form (ngSubmit)="confirmAdjustment()" #form="ngForm">
                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Datum</label>
                        <input
                            type="date"
                            pInputText
                            required
                            [(ngModel)]="date"
                            name="date"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Aktuální zůstatek (známý)</label>
                        <input
                            type="number"
                            pInputText
                            [readonly]="true"
                            [ngModel]="currentBalanceInput"
                            name="currentBalanceReadonly"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Nový skutečný zůstatek (zadá uživatel)</label>
                        <input
                            type="number"
                            pInputText
                            required
                            [(ngModel)]="newRealBalance"
                            name="newRealBalance"
                            (ngModelChange)="recalculateDifference()"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Rozdíl</label>
                        <input
                            type="number"
                            pInputText
                            [readonly]="true"
                            [ngModel]="difference"
                            name="differenceReadonly"
                        />
                        <small class="text-sm text-gray-500 block mt-1">
                            Rozdíl = nový skutečný zůstatek - aktuální zůstatek.
                            Kladné = výnos, záporné = náklad.
                        </small>
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Typ pohybu</label>
                        <p-select
                            [options]="movementTypeOptions"
                            [(ngModel)]="movementType"
                            name="movementType"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Vyber typ"
                            appendTo="body"
                            required
                        >
                        </p-select>
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Popis</label>
                        <input
                            type="text"
                            pInputText
                            [(ngModel)]="description"
                            name="description"
                            placeholder="Např. Úprava zůstatku k datu"
                        />
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <button
                            pButton
                            type="button"
                            label="Zrušit"
                            class="p-button-secondary"
                            (click)="hideDialog()"
                        ></button>
                        <button
                            pButton
                            type="submit"
                            label="Vytvořit pohyb"
                            [disabled]="!form.form.valid || difference === 0"
                        ></button>
                    </div>
                </form>
            </p-dialog>

            <p-toast></p-toast>
        </div>
    `
})
export class MovementBalanceAdjustWidget {
    @Input() accountIdInput!: number;
    /** Původní spočtený zůstatek účtu (z grafu / statistik / backendu) */
    @Input() currentBalanceInput!: number;

    @Output() movementCreated = new EventEmitter<void>();

    displayDialog = false;

    date = '';
    newRealBalance: number | null = null;
    difference = 0;
    movementType: MovementType = 'REVENUE';
    description = '';

    movementTypeOptions = [
        { label: 'Výnos (REVENUE)', value: 'REVENUE' as MovementType },
        { label: 'Náklad (EXPENSE)', value: 'EXPENSE' as MovementType },
        { label: 'Příjem (INFLOW)', value: 'INFLOW' as MovementType },
        { label: 'Výdej (OUTFLOW)', value: 'OUTFLOW' as MovementType }
    ];

    constructor(
        private movementService: MovementService,
        private messageService: MessageService
    ) {}

    showDialog() {
        if (!this.accountIdInput) {
            this.messageService.add({
                severity: 'error',
                summary: 'Chyba',
                detail: 'Chybí ID účtu'
            });
            return;
        }

        this.date = new Date().toISOString().substring(0, 10);
        this.newRealBalance = this.currentBalanceInput ?? 0;
        this.recalculateDifference();
        this.description = `Úprava zůstatku k ${this.date}`;
        this.displayDialog = true;
    }

    hideDialog() {
        this.displayDialog = false;
    }

    recalculateDifference() {
        if (this.newRealBalance == null || this.currentBalanceInput == null) {
            this.difference = 0;
            return;
        }

        const rawDifference = this.newRealBalance - this.currentBalanceInput;

        // zaokrouhlení na 2 desetinná místa – odstraní 23.000000000014 apod.
        this.difference = Number(rawDifference.toFixed(2));

        // automatické předvyplnění typu – můžeš vypnout, pokud chceš, aby to volil jen uživatel
        if (this.difference > 0) {
            this.movementType = 'REVENUE';
        } else if (this.difference < 0) {
            this.movementType = 'EXPENSE';
        }
    }

    confirmAdjustment() {
        if (!this.accountIdInput || this.difference === 0) {
            return;
        }

        const absAmount = Math.abs(this.difference);

        const movement: MovementCreateRequest = {
            accountId: this.accountIdInput,
            date: this.date,
            description: this.description || 'Úprava zůstatku',
            type: this.movementType,
            amount: absAmount,
            imported: false
        };

        this.movementService.createMovement(movement).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Uloženo',
                    detail: 'Pohyb pro úpravu zůstatku byl vytvořen'
                });
                this.displayDialog = false;
                this.movementCreated.emit();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Chyba',
                    detail: 'Pohyb se nepodařilo vytvořit'
                });
            }
        });
    }
}
