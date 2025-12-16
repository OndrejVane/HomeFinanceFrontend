import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProgressBar } from 'primeng/progressbar';

@Component({
    selector: 'app-file-demo',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ToastModule, ButtonModule],
    template: `<p-toast />
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-full lg:col-span-6">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Advanced</div>
                    <p-fileupload name="demo[]" [multiple]="true" accept="image/*" maxFileSize="1000000" mode="advanced" url="https://www.primefaces.org/cdn/api/upload.php">
                        <ng-template #empty>
                            <div>Drag and drop files to here to upload.</div>
                        </ng-template>
                    </p-fileupload>
                </div>
            </div>
            <div class="col-span-full lg:col-span-6">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Basic</div>
                    <div class="flex flex-col gap-4 items-center justify-center">
                        <p-fileupload #fu mode="basic" chooseLabel="Choose" chooseIcon="pi pi-upload" name="demo[]" url="https://www.primefaces.org/cdn/api/upload.php" accept="image/*" maxFileSize="1000000" />
                        <p-button label="Upload" (onClick)="fu.upload()" severity="secondary" />
                    </div>
                </div>
            </div>
            <div class="col-span-full lg:col-span-6">
                <div class="card">
                    <div class="font-semibold text-xl mb-4">Import pohybů</div>

                    <p-fileupload #fileUpload name="file" mode="advanced" [customUpload]="true"
                                  (uploadHandler)="uploadFile($event, fileUpload)" [multiple]="false" accept=".csv,.xml"
                                  maxFileSize="5000000">
                        <ng-template pTemplate="item" let-file>
                            <div class="flex align-items-center gap-3">
                                <span>{{ file.name }}</span>
                                <span class="text-sm text-gray-500"> ({{ file.size / 1024 | number: '1.0-0' }} kB) </span>
                            </div>
                        </ng-template>

                    </p-fileupload>
                </div>
            </div>
        </div>`,
    providers: [MessageService]
})
export class FileDemo {
    private readonly accountId = 853; // TODO: ⚠️ ideálně z routeru
    apiUrl: string = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private messageService: MessageService
    ) {}

    uploadFile(event: any, fileUpload: FileUpload) {
        const file: File = event.files[0];

        const formData = new FormData();
        formData.append('file', file); // MUSÍ být "file"

        this.http.post(this.apiUrl + `/account/${this.accountId}/import`, formData).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Import hotový',
                    detail: 'Pohyby byly úspěšně vytvořeny'
                });

                fileUpload.clear();
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
}
