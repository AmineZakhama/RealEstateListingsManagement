import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  login(credentials: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        if (user && user.token) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => {
        if (user && user.token) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  toggleFavorite(listingId: string): Observable<string[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.currentUserValue?.token}`);
    return this.http.post<string[]>(`${this.apiUrl}/favorites/${listingId}`, {}, { headers }).pipe(
      tap(favorites => {
        const user = this.currentUserValue;
        if (user) {
          user.favorites = favorites;
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  getFavorites(): Observable<any[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.currentUserValue?.token}`);
    return this.http.get<any[]>(`${this.apiUrl}/favorites`, { headers });
  }

  updateProfile(data: any): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.currentUserValue?.token}`);
    return this.http.put<User>(`${this.apiUrl}/profile`, data, { headers }).pipe(
      tap(user => {
        const currentUser = this.currentUserValue;
        if (currentUser && user) {
          const updatedUser = { ...currentUser, ...user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }
}
