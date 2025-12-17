import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiBaseUrlInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (req.url.startsWith('/')) {
            req = req.clone({
                url: environment.apiUrl + req.url
            });
        }
        return next.handle(req);
    }
}
