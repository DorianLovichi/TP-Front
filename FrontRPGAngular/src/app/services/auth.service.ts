import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.isLoggedInSubject.next(true);
      console.log('User is logged in from stored token');
    } else {
      this.isLoggedInSubject.next(false);
      console.log('No stored token found, user is logged out');
    }
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);
    
    const headers = new HttpHeaders();
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, formData, { 
      headers,
      withCredentials: true 
    }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          console.log('Token stored in localStorage');
        } else {
          localStorage.setItem(this.tokenKey, 'dummy_token');
          console.log('No token in response, storing dummy token');
        }
        this.isLoggedInSubject.next(true);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({} as LoginResponse);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSubject.next(false);
    console.log('User logged out, token removed');
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
}; 