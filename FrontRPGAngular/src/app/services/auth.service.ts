import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginResponse {
  message: string;
  [key: string]: any;
}

interface RegisterResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private authCheck$: Observable<boolean>;
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    this.authCheck$ = this.http.get(`${this.apiUrl}/check-auth`, { withCredentials: true }).pipe(
      tap(() => {
        this.isLoggedInSubject.next(true);
        console.log('User is logged in');
      }),
      catchError(() => {
        this.isLoggedInSubject.next(false);
        console.log('User is logged out');
        return of(false);
      }),
      map(() => this.isLoggedInSubject.value),
      shareReplay(1)
    );
    
    // Initial check
    this.authCheck$.subscribe();
  }

  checkAuth(): Observable<boolean> {
    return this.authCheck$;
  }

  register(userData: { username: string; email: string; password: string; recheck_password: string }): Observable<RegisterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData, { 
      headers,
      withCredentials: true 
    }).pipe(
      tap(response => {
        if (response.message === 'Registration successful') {
          this.isLoggedInSubject.next(true);
        }
        console.log('Registration response:', response);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of({ message: 'Registration failed' } as RegisterResponse);
      })
    );
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
        if (response.message === 'Login successful') {
          this.isLoggedInSubject.next(true);
        } else {
          console.log('Login failed:', response.message);
          this.isLoggedInSubject.next(false);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.isLoggedInSubject.next(false);
        return of({ message: 'Login failed' } as LoginResponse);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.isLoggedInSubject.next(false);
        console.log('User logged out');
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.isLoggedInSubject.next(false);
        return of({ message: 'Logout failed' });
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // For session-based auth, we just need to ensure withCredentials is true
  const modifiedReq = req.clone({
    withCredentials: true
  });
  return next(modifiedReq);
}; 