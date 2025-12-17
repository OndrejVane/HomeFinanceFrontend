import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { Account } from '@/pages/account/account.model';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@/pages/account/account.service';

@Component({
    selector: 'app-account-crud',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToolbarModule, InputTextModule, DialogModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    template: `
        <div *ngIf="account">
            <h1>{{account.name}}</h1>

            <p>Name: {{ account.name }}</p>
            <p>Code: {{ account.code }}</p>
            <p>Balance: {{ account.currentBalance }}</p>
        </div>
    `
})
export class AccountPage implements OnInit {
    accountId!: number;
    account?: Account;

    constructor(
        private route: ActivatedRoute,
        private accountService: AccountService
    ) {}

    ngOnInit(): void {
        this.accountId = Number(this.route.snapshot.paramMap.get('id'))!;
        this.loadAccount();
    }

    loadAccount() {
        this.accountService.getById(this.accountId).subscribe({
            next: (acc) => (this.account = acc),
            error: (err) => console.error('Chyba při načítání účtu', err)
        });
    }
}
