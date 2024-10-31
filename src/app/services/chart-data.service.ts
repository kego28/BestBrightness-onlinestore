import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private apiBaseUrl = 'http://localhost/user_api'; // Replace with your actual backend path

  constructor(private http: HttpClient) {}

  getStockLevelsByCategory(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/getStockLevelsByCategory.php`);
  }

  getUserCountByRole(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/getUserCountByRole.php`);
  }
  getChartData(chartType: string): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/statestics.php?chart=${chartType}`);
  }
  
}
