import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private apiBaseUrl = 'http://localhost/user_api'; // Replace with your actual backend path

  constructor(private http: HttpClient) {}

  getOrdersByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/getOrdersByStatus.php`);
  }

  getProductPopularity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/getProductPopularity.php`);
  }

  getSalesTrends(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/getSalesTrends.php`);
  }

  getStockLevelsByCategory(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/getStockLevelsByCategory.php`);
  }

  getUserCountByRole(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/getUserCountByRole.php`);
  }
}
