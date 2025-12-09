import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenStorageService } from '@/auth/token-storage.service';
import { tap } from 'rxjs';
import { UserLoginRequest } from '@/model/userLoginRequest';
import { UserRegisterRequest } from '@/model/userRegisterRequest';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    apiUrl: string = environment.apiUrl;
    constructor(
        private http: HttpClient,
        private storage: TokenStorageService
    ) {}

    register(userRegisterRequest: UserRegisterRequest) {
        return this.http.post(this.apiUrl + '/auth/register', userRegisterRequest, { withCredentials: false });
    }

    login(userLoginRequest: UserLoginRequest) {
        return this.http.post(this.apiUrl + '/auth/login', userLoginRequest, { withCredentials: true }).pipe(
            tap((res: any) => {
                this.storage.setAccessToken(res.accessToken);
            })
        );
    }

    refreshToken() {
        return this.http.post(this.apiUrl + '/auth/refresh-token', {}, { withCredentials: true }).pipe(
            tap((res: any) => {
                console.log("refreshToken inside")
                this.storage.setAccessToken(res.accessToken);
            })
        );
    }

    logout() {
        this.http.post(this.apiUrl + '/auth/logout', {}, {withCredentials: true});
        this.storage.clear();
    }

    isLoggedIn(): boolean {
        return !!this.storage.getAccessToken();
    }
}
