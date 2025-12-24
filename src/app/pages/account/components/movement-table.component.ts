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
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MovementService, MovementResponse } from '../movement.service';
import { CzCurrencyPipe } from '@/pages/currency/formaters/cz-currency-formatter';
import { CzDateFormatter } from '@/pages/currency/formaters/cz-date-formatter';
import { MovementTag } from '@/pages/account/model/movement-tag.model';
import { MovementTagService } from '@/pages/account/movement-tag.service';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';

@Component({
    selector: 'app-movement-table',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, InputTextModule, InputNumberModule, ButtonModule, Select, CzCurrencyPipe, CzDateFormatter, Tag, ConfirmDialogModule, TranslateModule, AutoComplete],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-table [value]="movements" [lazy]="true" [lazyLoadOnInit]="true" [paginator]="true" [rows]="20" [totalRecords]="totalRecords" [loading]="loading" dataKey="id" editMode="row" (onLazyLoad)="loadMovements($event)">
            <ng-template pTemplate="header">
                <tr>
                    <th>Date</th>
                    <th>New</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Tag</th>
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

                    <!-- MovementTag sloupec -->
                    <td>
                        <p-autoComplete
                            [(ngModel)]="row.movementTag"
                            [suggestions]="filteredMovementTags"
                            (completeMethod)="filterMovementTags($event)"
                            [forceSelection]="false"
                            [dropdown]="true"
                            (onSelect)="onMovementTagSelected(row, $event)"
                            (onBlur)="onMovementTagBlur(row)"
                            inputId="movementTag-{{ row.id }}"
                            placeholder="Typ nákladu/výnosu"
                            optionLabel="name"
                        >
                        </p-autoComplete>
                    </td>

                    <!-- Actions -->
                    <td class="text-center">
                        <p-button (click)="confirmDelete(row)" icon="pi pi-times" severity="danger" text raised rounded></p-button>
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
    movementTags: MovementTag[] = [];
    filteredMovementTags: MovementTag[] = [];
    totalRecords = 0;
    loading = true;

    positiveMovementTypes: { label: string; value: string }[] = [];
    negativeMovementTypes: { label: string; value: string }[] = [];

    constructor(
        private movementTagService: MovementTagService,
        private movementService: MovementService,
        private confirmationService: ConfirmationService,
        private translate: TranslateService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadMovementTags();
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

    private loadMovementTags(): void {
        this.movementTagService.getAll().subscribe({
            next: (tags) => {
                this.movementTags = tags;

                // znovu projít už načtené pohyby a doplnit jim MovementTag
                this.movements.forEach((movement) => {
                    if (movement.movementTagId != null && !movement.movementTag) {
                        const tag = this.movementTags.find((t) => t.id === movement.movementTagId);
                        if (tag) {
                            (movement as any).movementTag = tag;
                        }
                    }
                });
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Chyba',
                    detail: 'Nepodařilo se načíst MovementTagy'
                })
        });
    }

    // Volá se při psaní do p-autoComplete
    filterMovementTags(event: { query: string }): void {
        const query = event.query?.toLowerCase() ?? '';
        this.filteredMovementTags = this.movementTags.filter((tag) => tag.name.toLowerCase().includes(query));
    }

    // Vybrán existující tag ze seznamu
    onMovementTagSelected(movement: MovementResponse, event: AutoCompleteSelectEvent): void {
        console.log("onMovementTagSelected");
        const selectedTag = event.value as MovementTag;

        if (selectedTag.id != null) {
            movement.movementTagId = selectedTag.id;
            movement.imported = false; // už to není „nový“ pohyb
            this.saveMovementTagChange(movement, selectedTag);
        }
    }

        onMovementTagBlur(movement: MovementResponse): void {
            const value = (movement as any).movementTag as any;

            // 1) Už je tam MovementTag objekt → nic nedělat
            if (value && typeof value === 'object' && 'id' in value) {
                return;
            }

            // 2) Prázdný string → nic
            if (!value || typeof value !== 'string' || !value.trim()) {
                return;
            }

            const name = value.trim();

            // 3) Existující tag podle jména
            const existing = this.movementTags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
            if (existing) {
                if (existing.id != null) {
                    (movement as any).movementTag = existing;      // pro UI
                    movement.movementTagId = existing.id;          // pro BE
                    movement.imported = false;                     // už není nový
                    this.saveMovementTagChange(movement, existing);
                }
                return;
            }

            // 4) Vytvořit nový tag
            const newTag: MovementTag = {
                name,
                expense: this.isMovementExpense(movement)
            };

            this.movementTagService.create(newTag).subscribe({
                next: (created) => {
                    this.movementTags.push(created);
                    if (created.id != null) {
                        (movement as any).movementTag = created;
                        movement.movementTagId = created.id;
                    }
                    movement.imported = false; // při vytvoření tagu taky shodit
                    this.saveMovementTagChange(movement, created);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Vytvořen tag',
                        detail: `Tag "${created.name}" byl vytvořen a přiřazen pohybu.`
                    });
                },
                error: () =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Chyba',
                        detail: 'Nepodařilo se vytvořit nový MovementTag.'
                    })
            });
        }

    private saveMovementTagChange(movement: MovementResponse, tag: MovementTag): void {
        // pokud Movement má jen movementTagId:
        if (movement.movementTag.id != null) {
            movement.movementTagId = movement.movementTag.id;
            console.log("movement.movementTag.id:", movement.movementTag.id);
            console.log("movement.movementTagId:", movement.movementTagId);
        }

        console.log("saveMovementTagChange", movement, tag);
        console.log("saveMovementTagChangeTEST", movement.movementTagId);

        this.movementService.updateMovement(movement).subscribe({
            next: (updated) => {
                Object.assign(movement, updated);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Uloženo',
                    detail: 'Tag pohybu byl aktualizován.'
                });
            },
            error: () =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Chyba',
                    detail: 'Nepodařilo se uložit změnu tagu.'
                })
        });
    }

    private isMovementExpense(movement: MovementResponse): boolean {
        // upravte podle vaší domény
        return (movement as any).amount < 0;
    }

    loadMovements(event: any) {
        const page = event.first / event.rows;
        const size = event.rows;

        this.movementService.getMovements(this.accountId, page, size).subscribe({
            next: (pageData) => {
                this.movements = pageData.content;
                this.totalRecords = pageData.totalElements;
                this.loading = false;

                // namapovat MovementTag objekt podle movementTagId
                this.movements.forEach((movement) => {
                    if (movement.movementTagId != null && !movement.movementTag) {
                        const tag = this.movementTags.find((t) => t.id === movement.movementTagId);
                        if (tag) {
                            (movement as any).movementTag = tag;
                        }
                    }
                });
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    saveMovement(movement: MovementResponse) {
        console.log("saveMovement");
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
