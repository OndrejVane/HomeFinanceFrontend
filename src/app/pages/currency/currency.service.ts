// currency.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Currency } from './currency.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CurrencyService {

    baseApiUrl: string = environment.apiUrl;
    private readonly apiUrl = this.baseApiUrl + '/currency'; // uprav dle proxy / baseUrl

    constructor(private http: HttpClient) {}

    getCurrencies(): Observable<Currency[]> {
        return this.http.get<Currency[]>(this.apiUrl);
    }

    create(currency: Currency): Observable<Currency> {
        return this.http.post<Currency>(this.apiUrl, currency);
    }

    update(currency: Currency): Observable<Currency> {
        return this.http.put<Currency>(`${this.apiUrl}/${currency.id}`, currency);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
