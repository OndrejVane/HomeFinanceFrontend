import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({ name: 'ethCurrency', standalone: true })
@Injectable({ providedIn: 'root' })
export class EthCurrencyPipe implements PipeTransform {

    transform(value: number | undefined): string {
        if (value == null) return '';

        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
        }).format(value);

        return `${formatted} ETH`;
    }
}
