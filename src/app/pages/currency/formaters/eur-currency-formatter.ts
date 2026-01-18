import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'eurCurrency', standalone: true })
@Injectable({ providedIn: 'root' })
export class EurCurrencyPipe implements PipeTransform {

    transform(value: number | undefined): string {
        if (value == null) return '';

        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
}
