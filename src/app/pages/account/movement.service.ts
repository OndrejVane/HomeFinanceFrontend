import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@/api/api-endpoints';

export interface MovementResponse {
    id: number;
    date: string;
    description: string;
    type: 'REVENUE' | 'EXPENSE' | 'OUTFLOW' | 'INFLOW';
    amount: number;
    hash: string;
    accountId: number;
    imported: boolean;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

@Injectable({
    providedIn: 'root'
})
export class MovementService {

    constructor(private http: HttpClient) {}

    getMovements(
        accountId: number,
        page: number,
        size: number
    ): Observable<Page<MovementResponse>> {

        const params = new HttpParams()
            .set('accountId', accountId)
            .set('page', page)
            .set('size', size);

        return this.http.get<Page<MovementResponse>>(ApiEndpoints.Movement.base, { params });
    }

    updateMovement(movement: MovementResponse): Observable<void> {
        return this.http.put<void>(ApiEndpoints.Movement.byId(movement.id), movement);
    }

    deleteMovement(id: number): Observable<void> {
        return this.http.delete<void>(ApiEndpoints.Movement.byId(id));
    }
}
