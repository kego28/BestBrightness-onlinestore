import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private scannedValue = new BehaviorSubject<string>('');
  currentValue = this.scannedValue.asObservable();

  updateScannedValue(value: string) {
    this.scannedValue.next(value);
  }
}