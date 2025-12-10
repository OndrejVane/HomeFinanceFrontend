import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, switchMap, take, throwError } from 'rxjs';
import { TokenStorageService } from '@/auth/token-storage.service';
import { AuthService } from '@/auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;

    constructor(
        private storage: TokenStorageService,
        private auth: AuthService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const accessToken = this.storage.getAccessToken();

        const authReq = accessToken ? this.addToken(req, accessToken) : req.clone({ withCredentials: true });

        return next.handle(authReq).pipe(
            catchError(err => {
                if (err.status === 401 && !authReq.url.includes("/auth/refresh-token")) {
                    console.log("Auth token expired -> REFRESH TOKEN")
                    return this.handle401Error(authReq, next);
                }
                return throwError(() => err);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            if (this.auth.isLoggedIn()) {
                return this.auth.refreshToken().pipe(
                    switchMap((res) => {
                        this.isRefreshing = false;
                        this.storage.setAccessToken(res.accessToken);
                        return next.handle(this.addToken(request, res.accessToken));
                    }),
                    catchError((error) => {
                        console.log("Refresh token expired -> LOGOUT")
                        this.isRefreshing = false;
                        this.storage.clear();
                        this.router.navigate(["/login"]);
                        return throwError(() => error);
                    })
                );
            }
        }

        return next.handle(request);
    }

    private addToken(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });
    }
}
