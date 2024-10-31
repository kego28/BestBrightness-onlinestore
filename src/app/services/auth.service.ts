import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

private userData: any;

  setUserData(data: any) {
    this.userData = data;
  }

  getUserData() {
    return this.userData;
  }



}





