import { Injectable } from '@angular/core';

import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoadingService } from 'src/app/spinner.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  
  constructor(private auth: AuthService, private loadingService: LoadingService, ) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();
    const token = this.auth.getToken();
    
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(cloned).pipe(finalize(() => {
        this.loadingService.hide()
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingService.hide();
        return throwError(error);
      }));
    }
    
    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.hide()
      })
    );
  }  
}
