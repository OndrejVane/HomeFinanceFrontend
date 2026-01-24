import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@/api/api-endpoints';
import { MovementMonthlyStatsResponse } from '@/pages/account/model/movement-monthly-stats.model';
import { MovementYearlyStats } from '@/pages/account/model/movement-yearly-stats.model';
import { MovementCreateRequest } from '@/pages/account/model/movement-request.model';
import { MovementResponse } from '@/pages/account/model/movement-response.model';

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

    getMovements(accountId: number, page: number, size: number): Observable<Page<MovementResponse>> {
        const params = new HttpParams().set('accountId', accountId).set('page', page).set('size', size);

        return this.http.get<Page<MovementResponse>>(ApiEndpoints.Movement.base, { params });
    }

    createMovement(movement: MovementCreateRequest): Observable<void> {
        return this.http.post<void>(ApiEndpoints.Movement.base, movement);
    }

    updateMovement(movement: MovementResponse): Observable<void> {
        return this.http.put<void>(ApiEndpoints.Movement.byId(movement.id), movement);
    }

    deleteMovement(id: number): Observable<void> {
        return this.http.delete<void>(ApiEndpoints.Movement.byId(id));
    }

    getMonthlyStats(year: number, month: number | null, type: string, accountId?: number | null): Observable<MovementMonthlyStatsResponse[]> {
        return this.http.get<MovementMonthlyStatsResponse[]>(ApiEndpoints.Movement.monthlyWithParams(year, month, type, accountId));
    }

    getYearlyStats(year: number, accountId?: number | null): Observable<MovementYearlyStats[]> {
        const url = ApiEndpoints.Movement.yearlyWithParams(year, accountId);
        return this.http.get<MovementYearlyStats[]>(url);
    }
}
