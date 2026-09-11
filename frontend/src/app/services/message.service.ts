import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:5000/api/messages';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'Authorization': `Bearer ${user?.token}`
    });
  }

  sendMessage(messageData: any): Observable<any> {
    return this.http.post(this.apiUrl, messageData);
  }

  getMessages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUnreadCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/unread-count`, { headers: this.getHeaders() });
  }
}
