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
        const access = this.storage.getAccessToken();

        const authReq = access
            ? req.clone({
                setHeaders: { Authorization: `Bearer ${access}` },
                withCredentials: true // kvůli refresh endpointu
            })
            : req.clone({ withCredentials: true });

        return next.handle(authReq).pipe(
            catchError(err => {
                if (err.status === 401) {
                    return this.handle401Error(req, next);
                }
                return throwError(() => err);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            if (this.auth.isLoggedIn()) {
                console.log("before refreshToken");
                return this.auth.refreshToken().pipe(
                    switchMap((res) => {
                        this.isRefreshing = false;

                        this.storage.setAccessToken(res.accessToken);
                        console.log("refreshToken");
                        const newRequest = request.clone({
                            setHeaders: {
                                Authorization: `Bearer ${res.accessToken}`
                            },
                            withCredentials: true
                        });
                        return next.handle(newRequest);
                    }),
                    catchError((error) => {
                        this.isRefreshing = false;
                        console.log("Error catch");
                        this.storage.clear();

                        return throwError(() => error);
                    })
                );
            }
        }

        return next.handle(request);
    }
}
