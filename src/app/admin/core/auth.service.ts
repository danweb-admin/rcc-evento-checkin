import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'https://backend.rcc-londrina.online/api/v1';
  // private apiUrl = 'http://localhost:5290/api/v1';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string) {

    return this.http.post<any>(`${this.apiUrl}/usuarios-checkin/login`, { email, senha })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('email', email);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLogged() {
    return !!this.getToken();
  }
}
