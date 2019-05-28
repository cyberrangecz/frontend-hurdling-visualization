import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  /**
   * Intercepts HTTP requests and adds authorization token
   * @param req http request
   * @param next next http handler
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedReq = req.clone({
      headers: req.headers.append('Authorization', this.authService.getAuthorizationToken())
    });
    return next.handle(clonedReq)
      .pipe(tap((event: HttpEvent<any>) => {},
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              window.confirm('You cannot access this resource.');
            }
          }
        }));
  }

}

