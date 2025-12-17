import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'czCurrency', standalone: true })
export class CzCurrencyPipe implements PipeTransform {
    transform(value: number | undefined): string {
        if (value == null) return '';
        return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(value) + ',-';
    }
}
