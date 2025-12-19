import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, TranslateModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    constructor(private translate: TranslateService) {
        const supportedLanguages = ['cs', 'en'];
        this.translate.addLangs(supportedLanguages);
        this.translate.setFallbackLang('en'); // fallback bude vždy na en

        // 1. Zkusíme načíst uložený jazyk z localStorage
        const savedLanguage = localStorage.getItem('language');

        // 2. Zjistíme jazyk prohlížeče (např. 'cs-CZ' -> 'cs')
        const browserLang = this.translate.getBrowserLang();

        // Určení finálního jazyka
        let finalLang = 'en';

        if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
            finalLang = savedLanguage;
        } else if (browserLang && supportedLanguages.includes(browserLang)) {
            finalLang = browserLang;
        }

        this.translate.use(finalLang);
    }

    // Tuto metodu volejte při ručním přepnutí jazyka v UI
    switchLanguage(lang: string) {
        this.translate.use(lang);
        localStorage.setItem('language', lang);
    }
}
