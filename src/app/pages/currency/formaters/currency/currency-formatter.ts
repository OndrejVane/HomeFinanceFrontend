import { Pipe, PipeTransform } from '@angular/core';
import { CzkCurrencyPipe } from './cz-currency-formatter';
import { UsdCurrencyPipe } from './usd-currency-formatter';
import { EurCurrencyPipe } from '@/pages/currency/formaters/currency/eur-currency-formatter';
import { BtcCurrencyPipe } from '@/pages/currency/formaters/currency/btc-currency-formatter';
import { EthCurrencyPipe } from '@/pages/currency/formaters/currency/eth-currency-formatter';

@Pipe({
    name: 'currencyFormat',
    standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
    constructor(
        private cz: CzkCurrencyPipe,
        private usd: UsdCurrencyPipe,
        private eur: EurCurrencyPipe,
        private btc: BtcCurrencyPipe,
        private eth: EthCurrencyPipe
    ) {}

    transform(value: number | null | undefined, currencyCode: string): string {
        if (value == null) {
            return '';
        }

        return this.getCurrencyFormatter(currencyCode).transform(value);
    }

    getCurrencyFormatter(currencyCode: String): PipeTransform {
        switch (currencyCode) {
            case 'CZK':
                return this.cz;
            case 'USD':
                return this.usd;
            case 'EUR':
                return this.eur;
            case 'BTC':
                return this.btc;
            case 'ETH':
                return this.eth;
            default:
                return this.cz;
        }
    }
}
