import { MenuController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  currentUser:any;
  isScrolled = false;
  userId: string | null = null;
  isLoggedIn: boolean = false;
  // isScrolled = false;
  isMenuOpen = false;
  constructor(
    private menu: MenuController,
    private router: Router,
    private toastController: ToastController,
  ) {

    const navigation = this.router.getCurrentNavigation();

    // Check if navigation and its state are defined
    if (navigation?.extras.state) {
      this.currentUser = navigation.extras.state['user'] || null; // Use bracket notation
      console.log('Current User:', this.currentUser);
    } else {
      console.log('No user data found.');
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 20;
  }

  openMenu() {
    this.menu.open();
  }
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  async getUserId() {
    this.userId = sessionStorage.getItem('userId');
    console.log('Stored userId in sessionStorage:', this.userId);  // Log the userId to check
    if (this.userId) {
      this.router.navigate(['/account']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to log in to view your account', 'warning');
    
    }
  }

  Signup() {
    this.router.navigate(['/signup']);
  }

  browseProducts() {
    this.router.navigate(['/products'], { state: { user: this.currentUser } }); // Pass user data in state
  }

  viewPromotions() {
    this.router.navigate(['/promotions']);
  }

  async viewAccount() {
    await this.getUserId();
  }

  ngOnInit() {
    // Initial check for scroll position
    this.onWindowScroll();
    this.userId = sessionStorage.getItem('userId');
  }

  ngOnDestroy() {
    // No need to remove listener as @HostListener handles cleanup
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
}