import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenStorageService } from '@/auth/token-storage.service';
import { tap } from 'rxjs';
import { UserLoginRequest } from '@/model/userLoginRequest';
import { UserRegisterRequest } from '@/model/userRegisterRequest';
import { ApiEndpoints } from '@/api/api-endpoints';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
        private http: HttpClient,
        private storage: TokenStorageService
    ) {}

    register(userRegisterRequest: UserRegisterRequest) {
        return this.http.post(ApiEndpoints.Auth.register, userRegisterRequest, { withCredentials: false });
    }

    login(userLoginRequest: UserLoginRequest) {
        return this.http.post(ApiEndpoints.Auth.login, userLoginRequest, { withCredentials: true }).pipe(
            tap((res: any) => {
                this.storage.setAccessToken(res.accessToken);
            })
        );
    }

    refreshToken() {
        return this.http.post(ApiEndpoints.Auth.login, {}, { withCredentials: true }).pipe(
            tap((res: any) => {
                this.storage.setAccessToken(res.accessToken);
            })
        );
    }

    logout() {
        this.http.post(ApiEndpoints.Auth.logout, {}, { withCredentials: true });
        this.storage.clear();
    }

    isLoggedIn(): boolean {
        return !!this.storage.getAccessToken();
    }
}
