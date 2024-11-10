
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface User {
  user_id: number;      // Assuming 'user_id' is a number
  username: string;     // 'username' is a string
  email: string;        // 'email' is a string
  first_name: string;   // 'first_name' is a string
  last_name: string;    // 'last_name' is a string
  role: string;         // 'role' is a string (e.g., 'admin', 'user', etc.)
  created_at: string;   // 'created_at' is typically a string or Date object (can be string if formatted as ISO)
  updated_at: string;   // 'updated_at' is typically a string or Date object (same as above)
}
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiBaseUrl = 'http://localhost/user_api';
  
  constructor(private http: HttpClient) {}


  getOrdersByCustomerId(customerId: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiBaseUrl}/get_orders.php?user_id=${customerId}`);
    }



  // getUserById(userId: number): Observable<User> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   });

  //   return this.http.get(`${this.apiBaseUrl}/get_user.php?user_id=${userId}`, { headers })
  //     .pipe(
  //       catchError(error => {
  //         console.error('API Error:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }
  getUserById(userId: number): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.get<User>(`${this.apiBaseUrl}/get_user.php?user_id=${userId}`, { headers })
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }
  getOrdersByUserId(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/get_orders.php?user_id=${userId}`);
  }

getOrderProducts(orderNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/get_order_products.php?orderNumber=${orderNumber}`);
}



}
