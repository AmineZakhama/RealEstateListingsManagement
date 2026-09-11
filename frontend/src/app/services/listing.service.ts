import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing, ListingResponse } from '../models/listing.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = 'http://localhost:5000/api/listings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    let headers = new HttpHeaders();
    if (user && user.token) {
      headers = headers.set('Authorization', `Bearer ${user.token}`);
    }
    return headers;
  }

  getListings(params: any = {}): Observable<ListingResponse> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<ListingResponse>(this.apiUrl, { params: httpParams });
  }

  getListing(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }

  createListing(formData: FormData): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  updateListing(id: string, formData: FormData): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, formData, { headers: this.getHeaders() });
  }

  deleteListing(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
