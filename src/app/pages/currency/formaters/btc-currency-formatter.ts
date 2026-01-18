import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'btcCurrency', standalone: true })
@Injectable({ providedIn: 'root' })
export class BtcCurrencyPipe implements PipeTransform {

    transform(value: number | undefined): string {
        if (value == null) return '';

        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 8
        }).format(value);

        return `${formatted} ₿`;
    }
}
