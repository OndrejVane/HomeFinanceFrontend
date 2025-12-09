import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
    private ACCESS = 'access_token';

    setAccessToken(access: string) {
        localStorage.setItem(this.ACCESS, access);
    }

    getAccessToken() {
        return localStorage.getItem(this.ACCESS);
    }

    clear() {
        localStorage.removeItem(this.ACCESS);
    }
}
