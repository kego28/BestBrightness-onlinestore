import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = environment.api;

  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-payment-intent`, { amount });
  }

  confirmPayment(paymentIntentId: string, paymentMethodId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-payment`, {
      paymentIntentId,
      paymentMethodId
    });
  }
}
