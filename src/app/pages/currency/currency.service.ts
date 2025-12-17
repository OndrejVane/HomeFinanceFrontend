import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Currency } from './currency.model';
import { ApiEndpoints } from '@/api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class CurrencyService {

    constructor(private http: HttpClient) {}

    getCurrencies(): Observable<Currency[]> {
        return this.http.get<Currency[]>(ApiEndpoints.Currency.base);
    }

    create(currency: Currency): Observable<Currency> {
        return this.http.post<Currency>(ApiEndpoints.Currency.base, currency);
    }

    update(currency: Currency): Observable<Currency> {
        if (currency.id == null) {
            throw new Error("Currency.id is required for update");
        }
        return this.http.put<Currency>(ApiEndpoints.Currency.byId(currency.id), currency);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(ApiEndpoints.Currency.byId(id));
    }
}
