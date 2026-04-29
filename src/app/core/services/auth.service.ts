import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  testSimple(): Observable<any> {
    return this.http.get('http://localhost/php-backend/simple-test.php');
  }

  testServer(): Observable<any> {
    return this.http.get('http://localhost/php-backend/server-test.php');
  }

  testCors(): Observable<any> {
    return this.http.get('http://localhost/php-backend/cors-test.php');
  }

  login(username: string, password: string): Observable<AuthResponse> {
    const payload = {
      username: username,
      password: password
    };

    console.log('Making login request to:', `${environment.apiUrl}/auth/login`);
    console.log('Payload:', payload);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response.success) {
          const user: User = {
            username: username,
            token: response.token
          };
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  getAuthHeaders(): HttpHeaders {
    const user = this.currentUser;
    if (user?.token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${user.token}`
      });
    } else if (user?.username) {
      // Fallback to basic auth if no token
      return new HttpHeaders({
        'Authorization': 'Basic ' + btoa(user.username + ':' + (user.password || ''))
      });
    }
    return new HttpHeaders();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }
}