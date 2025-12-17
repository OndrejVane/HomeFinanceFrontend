import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '@/api/api-endpoints';
import { Account } from '@/pages/account/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
    constructor(private http: HttpClient) {}

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
}
