import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MovementService } from '@/pages/account/movement.service';
import { MovementCreateRequest } from '@/pages/account/model/movement-request.model';
import { MovementType } from '@/pages/account/model/movement-type.enum';

@Component({
    selector: 'app-movement-create',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DialogModule, Select, ToastModule],
    providers: [MessageService],
    template: `
        <div>
            <p-button label="New movement" icon="pi pi-plus" (onClick)="showDialog()"></p-button>

            <p-dialog
                header="New movement"
                [(visible)]="displayDialog"
                [modal]="true"
                [closable]="true"
                [style]="{ width: '450px' }"
            >
                <form (ngSubmit)="saveMovement()" #form="ngForm">
                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Date</label>
                        <input
                            type="date"
                            pInputText
                            required
                            [(ngModel)]="movement.date"
                            name="date"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Description</label>
                        <input
                            type="text"
                            pInputText
                            required
                            [(ngModel)]="movement.description"
                            name="description"
                        />
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Type</label>
                        <p-select
                            [options]="movementTypeOptions"
                            [(ngModel)]="movement.type"
                            name="type"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select type"
                            appendTo="body"
                            required
                        >
                        </p-select>
                    </div>

                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Amount</label>
                        <input
                            type="number"
                            pInputText
                            required
                            [(ngModel)]="movement.amount"
                            name="amount"
                        />
                    </div>

                    <!-- Volitelný tag, pokud ho budeš chtít doplnit později -->
                    <!--
                    <div class="mb-3">
                        <label class="block mb-1 font-medium">Tag</label>
                        <p-select
                            [options]="movementTags"
                            [(ngModel)]="movement.movementTagId"
                            name="movementTagId"
                            optionLabel="label"
                            optionValue="id"
                            placeholder="Select tag"
                            appendTo="body"
                        >
                        </p-select>
                    </div>
                    -->

                    <div class="flex justify-end gap-2 mt-4">
                        <button
                            pButton
                            type="button"
                            label="Cancel"
                            class="p-button-secondary"
                            (click)="hideDialog()"
                        ></button>
                        <button
                            pButton
                            type="submit"
                            label="Save"
                            [disabled]="!form.form.valid"
                        ></button>
                    </div>
                </form>
            </p-dialog>

            <p-toast></p-toast>
        </div>
    `
})
export class MovementCreateWidget {
    @Input() accountIdInput!: number;
    @Output() movementCreated = new EventEmitter<void>();

    displayDialog = false;

    movement: MovementCreateRequest = {
        accountId: 0,
        date: '',
        description: '',
        type: 'EXPENSE',
        amount: 0,
        imported: false
    };

    movementTypeOptions = [
        { label: 'Revenue', value: 'REVENUE' as MovementType },
        { label: 'Expense', value: 'EXPENSE' as MovementType },
        { label: 'Outflow', value: 'OUTFLOW' as MovementType },
        { label: 'Inflow', value: 'INFLOW' as MovementType }
    ];

    // Případně doplníš z backendu
    // movementTags: { id: number; label: string }[] = [];

    constructor(
        private movementService: MovementService,
        private messageService: MessageService
    ) {}

    showDialog() {
        if (!this.accountIdInput) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Account ID is missing'
            });
            return;
        }

        this.movement = {
            accountId: this.accountIdInput,
            date: new Date().toISOString().substring(0, 10), // dnešní datum YYYY-MM-DD
            description: '',
            type: 'EXPENSE',
            amount: 0,
            imported: false
        };

        this.displayDialog = true;
    }

    hideDialog() {
        this.displayDialog = false;
    }

    saveMovement() {
        if (!this.accountIdInput) {
            return;
        }

        this.movement.accountId = this.accountIdInput;

        this.movementService.createMovement(this.movement).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Movement created'
                });
                this.displayDialog = false;
                this.movementCreated.emit();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Could not create movement'
                });
            }
        });
    }
}
