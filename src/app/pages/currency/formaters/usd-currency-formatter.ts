import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'usdCurrency', standalone: true })
export class UsdCurrencyPipe implements PipeTransform {
    transform(value: number | undefined): string {
        if (value == null) return '';

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
}
