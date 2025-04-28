import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        this.currentUserSubject.next(parsedUser);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
  }

  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, formData)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: { email: string; username: string; password: string }): Observable<RegisterResponse> {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('username', userData.username);
    formData.append('password', userData.password);
    formData.append('recheck_password', userData.password);

    return this.http.post<RegisterResponse>(`${environment.apiUrl}/register`, formData)
      .pipe(
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
          this.router.navigate(['/login']);
        }),
        catchError(error => {
          console.error('Logout error:', error);
          this.clearAuth();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      )
      .subscribe();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
} 