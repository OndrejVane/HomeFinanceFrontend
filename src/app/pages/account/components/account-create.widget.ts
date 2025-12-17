import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccountService } from '@/pages/account/account.service';
import { CurrencyService } from '@/pages/currency/currency.service';
import { Account } from '@/pages/account/account.model';

@Component({
    selector: 'app-account-create',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, DialogModule, Select, ToastModule],
    providers: [MessageService],
    template: `
        <div>
            <p-button label="New account" icon="pi pi-plus" (onClick)="showDialog()"></p-button>

            <!-- Dialog pro nový účet -->
            <p-dialog header="New Account" [(visible)]="displayDialog" [modal]="true" [closable]="true"
                      [style]="{ width: '400px' }">
                <div class="mb-3">
                    <label class="block mb-1 font-medium">Name</label>
                    <input type="text" pInputText [(ngModel)]="account.name" (ngModelChange)="onNameChange()"/>
                </div>

                <div class="mb-3">
                    <label class="block mb-1 font-medium">Code</label>
                    <input type="text" pInputText [(ngModel)]="account.code" />
                </div>

                <div class="mb-3">
                    <label class="block mb-1 font-medium">Currency</label>
                    <p-select [options]="currencies" [(ngModel)]="account.currency" optionLabel="label" optionValue="id"
                              placeholder="Select currency" appendTo="body">
                    </p-select>
                </div>

                <div class="mb-3">
                    <label class="block mb-1 font-medium">Initial Balance</label>
                    <input type="number" pInputText [(ngModel)]="account.initialBalance" />
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button pButton type="button" label="Cancel" class="p-button-secondary" (click)="hideDialog()"></button>
                    <button pButton type="button" label="Save" (click)="saveAccount()"></button>
                </div>
            </p-dialog>

            <p-toast></p-toast>
        </div>
    `
})
export class AccountCreateComponent {
    @Output() accountCreated = new EventEmitter<void>();

    displayDialog = false;
    account: Partial<Account> = {};
    currencies: { id: number; label: string }[] = [];

    constructor(
        private accountService: AccountService,
        private currencyService: CurrencyService,
        private messageService: MessageService
    ) {
        this.loadCurrencies();
    }

    showDialog() {
        this.account = {}; // reset formulář
        this.displayDialog = true;
    }

    hideDialog() {
        this.displayDialog = false;
    }

    loadCurrencies() {
        this.currencyService.getCurrencies().subscribe({
            next: (data) => {
                this.currencies = data
                    .filter(c => c.id != null)
                    .map(c => ({
                        id: c.id!,
                        label: `${c.code} - ${c.name}`
                    }));
            }
        });
    }

    saveAccount() {
        this.accountService.create(this.account as Account).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account created' });
                this.displayDialog = false;
                this.accountCreated.emit();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create account' });
            }
        });
    }

    onNameChange() {
        if (this.account.name) {
            const words = this.account.name.trim().split(/\s+/);
            // vezme první písmeno každého slova a spojí
            let code = words.map(w => w[0]).join('');
            code = code.toUpperCase();

            // volitelně omezit délku, např. max 5 znaků
            code = code.slice(0, 5);

            this.account.code = code;
        } else {
            this.account.code = '';
        }
    }
}
