// import { Component } from '@angular/core';
// import { MenuController } from '@ionic/angular';
// import { Router, NavigationEnd, Event } from '@angular/router';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
// })
// export class AppComponent {
//   public appPages = [
//     { title: 'Home', url: '/home', icon: 'home' },
//     { title: 'Products', url: '/products', icon: 'grid' },
//     { title: 'Promotions', url: '/promotions', icon: 'pricetag' },
//     { title: 'Account', url: '/account', icon: 'person' },
//   ];

//   public adminPages = [
//     { title: 'Admin Dashboard', url: '/admin-dashboard' },
//     { title: 'Customer Management', url: '/admin-customer-management' },
//     { title: 'Inventory Management', url: '/admin-inventory-management' },
//     { title: 'Order Management', url: '/admin-order-management' },
//     { title: 'Sales Report', url: '/admin-sales-report' },
//     { title: 'User Management', url: '/admin-user-management' },
//   ];

//   public showAdminButtons = false;

//   constructor(private menu: MenuController, private router: Router) {
//     this.initializeApp();
//   }

//   navigateToAuth() {
//     this.router.navigate(['/auth']);
//   }

//   initializeApp() {
//     this.menu.enable(true, 'first');
//     this.router.events.pipe(
//       filter((event): event is NavigationEnd => event instanceof NavigationEnd)
//     ).subscribe((event: NavigationEnd) => {
//       const adminUrls = this.adminPages.map(page => page.url);
//       this.showAdminButtons = adminUrls.includes(event.urlAfterRedirects);
//     });
//   }
// }
// import { Component, HostListener } from '@angular/core';
// import { MenuController } from '@ionic/angular';
// import { Router, NavigationEnd } from '@angular/router';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-root',
//   templateUrl: 'app.component.html',
//   styleUrls: ['app.component.scss'],
// })
// export class AppComponent {
//   public adminPages = [
//     { title: 'Admin Dashboard', url: '/admin-dashboard', icon: 'speedometer-outline' },
//     { title: 'User Management', url: '/admin-user-management', icon: 'people-circle-outline' },
//     { title: 'Customer Management', url: '/admin-customer-management', icon: 'people-outline' },
//     { title: 'Inventory Management', url: '/admin-inventory-management', icon: 'cube-outline' },
//     { title: 'Order Management', url: '/admin-order-management', icon: 'cart-outline' },
//     { title: 'Sales Report', url: '/admin-sales-report', icon: 'bar-chart-outline' },
//   ];

//   public isMenuOpen = false;
//   public isScrolled = false;

//   constructor(private menu: MenuController, private router: Router) {
//     this.initializeApp();
//   }

//   initializeApp() {
//     this.router.events.pipe(
//       filter((event): event is NavigationEnd => event instanceof NavigationEnd)
//     ).subscribe(() => {
//       this.isMenuOpen = false;
//     });
//   }

//   toggleMenu() {
//     this.isMenuOpen = !this.isMenuOpen;
//   }

//   closeMenu() {
//     this.isMenuOpen = false;
//   }

//   @HostListener('window:scroll', ['$event'])
//   onScroll() {
//     this.isScrolled = window.scrollY > 0;
//   }
// }
import { Component, HostListener } from '@angular/core';
import { MenuController, ToastController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public adminPages = [
    { title: 'Admin Dashboard', url: '/admin-dashboard', icon: 'speedometer-outline' },
    { title: 'User Management', url: '/admin-user-management', icon: 'people-circle-outline' },
    { title: 'Customer Management', url: '/admin-customer-management', icon: 'people-outline' },
    { title: 'Inventory Management', url: '/admin-inventory-management', icon: 'cube-outline' },
    { title: 'Order Management', url: '/admin-order-management', icon: 'cart-outline' },
    { title: 'Sales Report', url: '/admin-sales-report', icon: 'bar-chart-outline' }
    // { title: '', url: '/admin-sales-report', icon: 'bar-chart-outline' }
  ];

  public isMenuOpen = false;
  public isScrolled = false;
  public isAdminPage = false;
  isLoggedIn: boolean =true;
  // currentUser: null | undefined;

  constructor(private menu: MenuController, private router: Router, private toastController: ToastController,) {
    this.initializeApp();
  }

  initializeApp() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isMenuOpen = false;
      this.isAdminPage = this.checkIfAdminPage(event.urlAfterRedirects);
    });
  }

  checkIfAdminPage(url: string): boolean {
    return this.adminPages.some(page => url.startsWith(page.url));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  async logout() {
    sessionStorage.removeItem('userId');
    this.isLoggedIn = false;
    // this.currentUser = null;
    await this.presentToast('You have logged out successfully', 'success');
    this.router.navigate(['/products']);
  }
  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 0;
  }
}

