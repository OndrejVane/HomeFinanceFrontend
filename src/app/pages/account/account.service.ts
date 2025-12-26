import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Account } from './account.model';
import { ApiEndpoints } from '@/api/api-endpoints';
import { AccountStatsResponse } from '@/pages/account/model/account-stats.model';
import { ImportResult } from '@/pages/account/movement-import-result.model';
import { DailyAccountStat } from '@/pages/account/model/account-daily-stats.model';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    constructor(private http: HttpClient) {}

    getById(id: number): Observable<Account> {
        return this.http.get<Account>(ApiEndpoints.Account.byId(id));
    }

    getStats(id: number): Observable<AccountStatsResponse> {
        return this.http.get<AccountStatsResponse>(ApiEndpoints.Account.stats(id));
    }

    getAll(): Observable<Account[]> {
        return this.http.get<Account[]>(ApiEndpoints.Account.base);
    }

    create(account: Account): Observable<Account> {
        return this.http.post<Account>(ApiEndpoints.Account.base, account);
    }

    update(account: Account): Observable<Account> {
        if (account.id == null) {
            throw new Error('Account.id is required for update');
        }
        return this.http.put<Account>(ApiEndpoints.Account.byId(account.id), account);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(ApiEndpoints.Account.byId(id));
    }

    importMovements(id: number, file: File): Observable<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ImportResult>(ApiEndpoints.Account.import(id), formData);
    }

    getDailyBalance(accountId: number | string): Observable<DailyAccountStat[]> {
        return this.http.get<DailyAccountStat[]>(ApiEndpoints.Account.dailyBalance(accountId));
    }
}
