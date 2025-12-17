import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AccountWidgetComponent } from '@/pages/account/components/accountwidget';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { Account } from '@/pages/account/account.model';
import { Observable } from 'rxjs';
import { AccountService } from '@/pages/account/account.service';

@Component({
    selector: 'app-account-crud',
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
        ConfirmDialogModule,
        AccountWidgetComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <h1>Accounts</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <app-account-widget *ngFor="let account of accounts$ | async" [account]="account"></app-account-widget>
        </div>
    `
})
export class AccountsPage implements OnInit {
    accounts$!: Observable<Account[]>;

    constructor(private accountService: AccountService) {}

    ngOnInit(): void {
        this.accounts$ = this.accountService.getAll();
    }
}
