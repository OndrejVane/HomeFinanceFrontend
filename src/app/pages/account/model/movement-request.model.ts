import { MovementType } from '@/pages/account/model/movement-type.enum';

export interface MovementCreateRequest {
    accountId: number;
    date: string;
    description: string;
    type: MovementType;
    amount: number;
    movementTagId?: number | null;
    imported: boolean;
}
