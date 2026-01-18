import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'czkCurrency', standalone: true })
@Injectable({ providedIn: 'root' })
export class CzkCurrencyPipe implements PipeTransform {
    transform(value: number | undefined): string {
        if (value == null) return '';
        return new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 }).format(value) + ',-';
    }
}
