export interface Account {
    id?: number;
    code: string;
    name: string;
    initialBalance: number;
    currency: number;
    currencyCode: string;
    importType: string;
    currentBalance: number;
    currentBalanceCzk: number;
    last30DaysBalance: number;
}
