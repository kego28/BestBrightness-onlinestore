// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// interface Promotion {
//   promotion_id: number;
//   product_id: number;
//   product_name: string;
//   name: string;
//   description: string;
//   discount_percentage: number;
//   start_date: string;
//   end_date: string;
// }

// @Component({
//   selector: 'app-promotions',
//   templateUrl: './promotions.page.html',
//   styleUrls: ['./promotions.page.scss'],
// })
// export class PromotionsPage implements OnInit {

//   promotions: Promotion[] = [];

//   constructor(private http: HttpClient) { }

//   ngOnInit() {
//     this.fetchPromotions();
//   }

//   fetchPromotions() {
//     this.http.get<Promotion[]>('http://localhost/user_api/promotions.php')
//       .subscribe(
//         (response) => {
//           this.promotions = response;
//         },
//         (error) => {
//           console.error('Error fetching promotions:', error);
//         }
//       );
//   }

//   isPromotionValid(endDate: string): boolean {
//     const now = new Date();
//     const promotionEndDate = new Date(endDate);
//     return now <= promotionEndDate;
//   }

//   getDaysRemaining(endDate: string): number {
//     const now = new Date();
//     const promotionEndDate = new Date(endDate);
//     const diffTime = promotionEndDate.getTime() - now.getTime();
//     return Math.ceil(diffTime / (1000 * 3600 * 24));
//   }
// }
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

interface Promotion {
  promotion_id: number;
  product_id: number;
  product_name: string;
  name: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
}

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.page.html',
  styleUrls: ['./promotions.page.scss'],
})
export class PromotionsPage implements OnInit {
  promotions: Promotion[] = [];
  loading = false;
  error: string | null = null;
  isMenuOpen = false;
  isScrolled = false;


  constructor(
    private http: HttpClient,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.fetchPromotions();
  }
 
  // @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  async fetchPromotions() {
    const loading = await this.loadingController.create({
      message: 'Loading promotions...',
      spinner: 'circular',
    });
    await loading.present();

    this.http.get<Promotion[]>('http://localhost/user_api/promotions.php')
      .subscribe(
        (response) => {
          this.promotions = response;
          loading.dismiss();
        },
        (error) => {
          console.error('Error fetching promotions:', error);
          this.error = 'Failed to load promotions. Please try again.';
          loading.dismiss();
        }
      );
  }

  isPromotionValid(endDate: string): boolean {
    const now = new Date();
    const promotionEndDate = new Date(endDate);
    return now <= promotionEndDate;
  }

  getDaysRemaining(endDate: string): number {
    const now = new Date();
    const promotionEndDate = new Date(endDate);
    const diffTime = promotionEndDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 3600 * 24));
  }

  getTimeRemaining(endDate: string): { days: number; hours: number; minutes: number } {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }

  onShopNow(promotion: Promotion): void {
    // Implement shopping logic here
    console.log('Shopping for:', promotion.product_name);
  }
}