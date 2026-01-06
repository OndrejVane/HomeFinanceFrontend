import { MovementTag } from '@/pages/account/model/movement-tag.model';

export interface MovementResponse {
    id: number;
    date: string;
    description: string;
    type: 'REVENUE' | 'EXPENSE' | 'OUTFLOW' | 'INFLOW';
    amount: number;
    hash: string;
    accountId: number;
    imported: boolean;
    movementTagId: number;
    movementTag: MovementTag;
}
