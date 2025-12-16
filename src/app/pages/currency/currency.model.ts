// currency.model.ts
export interface Currency {
    id?: number;      // nebo string – podle SuperEntity
    code: string;
    name: string;
}
