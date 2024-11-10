import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: number;
  date: Date;
  status: 'pending' | 'completed' | 'canceled';
  items: OrderItem[];
  total: number;
}
@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private apiBaseUrl = 'http://localhost/user_api'; 

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


  getSalesByDay(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/analyseSales.php`, {
      params: new HttpParams().set('type', 'day')
    });
  }

  getSalesByWeek(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/analyseSales.php`, {
      params: new HttpParams().set('type', 'week')
    });
  }

  getSalesByMonth(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/analyseSales.php`, {
      params: new HttpParams().set('type', 'month')
    });
  }

  getSalesByYear(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/analyseSales.php`, {
      params: new HttpParams().set('type', 'year')
    });
  }


  getSalesData(period: string): Observable<any> {
  
    let params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiBaseUrl}/analyseSales.php`,{ params });
  }

 

}
