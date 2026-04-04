import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkInitialAuth();
  }

  private checkInitialAuth(): void {
    const token = this.getToken();
    this.isAuthenticatedSignal.set(!!token);
  }

  login(login: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('https://api.teyca.ru/test-auth-only', {
      login,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.isAuthenticatedSignal.set(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSignal.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }
}