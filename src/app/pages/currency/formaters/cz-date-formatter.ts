import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'czDateFormatter'
})
export class CzDateFormatter implements PipeTransform {
    transform(value: string | Date | null | undefined): string {
        if (!value) {
            return '';
        }

        const date = typeof value === 'string' ? new Date(value) : value;
        const day = date.getDate();
        const month = date.getMonth() + 1; // měsíce jsou 0-indexované
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    }
}
