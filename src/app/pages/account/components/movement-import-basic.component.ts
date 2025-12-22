import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccountService } from '@/pages/account/account.service';
import { ImportResult } from '@/pages/account/movement-import-result.model';

@Component({
    selector: 'app-account-import-basic',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ButtonModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Import pohybů</div>

            <div class="flex flex-col gap-4 items-center justify-center">
                <p-fileupload
                    #fileUpload
                    name="file"
                    mode="basic"
                    chooseLabel="Vybrat soubor"
                    chooseIcon="pi pi-upload"
                    [customUpload]="true"
                    (uploadHandler)="onUpload($event, fileUpload)"
                    [multiple]="false"
                    accept=".csv,.xml"
                    [maxFileSize]="5000000"
                    (onSelect)="onSelect()"
                ></p-fileupload>

                <p-button
                    label="Nahrát"
                    (onClick)="fileUpload.upload()"
                    severity="secondary"
                    [disabled]="!hasFile"
                />
            </div>
        </div>
        <p-toast></p-toast>
    `
})
export class AccountImportBasicComponent {
    @Input({ required: true }) accountId!: number;
    @Output() completed = new EventEmitter<void>();

    @ViewChild('fileUpload') fileUpload?: FileUpload;

    hasFile = false;

    constructor(
        private messageService: MessageService,
        private accountService: AccountService
    ) {}

    onUpload(event: any, fileUpload: FileUpload): void {
        const file: File | undefined = event.files?.[0];
        if (!file) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Žádný soubor',
                detail: 'Vyberte prosím soubor k importu.'
            });
            return;
        }

        this.accountService.importMovements(this.accountId, file).subscribe({
            next: (result: ImportResult) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Import úspěšně dokončen',
                    detail: `Vytvořeno: ${result.imported}\npřeskočeno: ${result.skipped}\nchyb: ${result.failed}`
                });

                fileUpload.clear();
                this.hasFile = false;
                this.completed.emit();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Chyba importu',
                    detail: err?.error?.message ?? 'Import selhal'
                });
            }
        });
    }

    // Volitelné – pokud chceš dynamicky povolovat tlačítko podle vybraného souboru:
    onSelect(): void {
        this.hasFile = true;
    }

    onClear(): void {
        this.hasFile = false;
    }
}
