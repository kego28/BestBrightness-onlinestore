
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';
import { StripeService } from '../../../services/stripe.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  stripe: Stripe | null = null;
  card: any;
  processing = false;
  cartItems: any[] = [];
  total = 1000;
  clientSecret: string | null = null;
  isLoggedIn: boolean=false;
  currentUserName: string ="";

  // userData: { email: string | null; role: string | null; userId: string | null; username: string | null; };
  userData: any;
  constructor(
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private stripeService: StripeService
  ) {
    this.paymentForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
    });
  }

  async ngOnInit() {
    // Load Stripe
    this.stripe = await loadStripe(environment.stripePublishableKey);

    alert(JSON.stringify(this.stripe));
    if (!this.stripe) {
      await this.showToast('Failed to load Stripe', 'danger');
      return;
    }

    const elements = this.stripe.elements();

    // Create card element
    this.card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });

    // Mount card element
    this.card.mount('#card-element');

    // Handle real-time validation errors
    this.card.addEventListener('change', this.handleCardChange.bind(this));

    // Load cart items
    this.loadCartItems();
    
    // Create payment intent
    await this.createPaymentIntent();
  }
  isMenuOpen = false;
  isScrolled = false;
  currentUser:any;

  isCashier: boolean = false;
  isAdmin: boolean = false;
  showTooltip: boolean = false;
  cartCount: number = 0;
  // @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  
  Signup() {
    this.router.navigate(['/signup']);
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  onSubmit(){}

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }
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
  async viewAccount() {
    await this.toAccount();
  }
  getUserRole() {
    if (this.userData.role === 'admin') {
      this.isAdmin = true;
    } else if (this.userData.role  === 'cashier') {
      this.isCashier = true;
    }
    else{
      this.isAdmin = false;
      this.isCashier = false;
    }
  }
  async toAccount() {
   
    console.log('Stored userId in sessionStorage:', this.userData.userId);  // Log the userId to check
    if (this.userData.userId) {
      this.router.navigate(['/account']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to log in to view your account', 'warning');
    
    }
  }
  async cashier() {
 
    console.log('Stored userId in sessionStorage:', this.userData .userId);  // Log the userId to check
    if (this.userData.userId && this.userData .role ==='cashier') {
      this.router.navigate(['/pos']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to login as cashier to access this page', 'warning');
    
    }
  }

  async admin() {
  
    console.log('Stored userId in sessionStorage:', this.userData.userId);  // Log the userId to check
    if (this.userData.userId && this.userData.role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to log in as admin to view admin pages', 'warning');
    
    }
  }
  async logout() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.currentUserName ='';
    // this.userData.userId ='';
    this.userData = {
      email: sessionStorage.getItem('userEmail'),
      role: sessionStorage.getItem('userRole'),
      userId: sessionStorage.getItem('userId'),
      username: sessionStorage.getItem('username')
  };
    this.getUserRole();
    await this.presentToast('You have logged out successfully', 'success');
    this.router.navigate(['/products']);
  }
  
  private async createPaymentIntent() {
    try {
      const response = await this.stripeService.createPaymentIntent(this.total).toPromise();
      this.clientSecret = response.clientSecret;
    } catch (error: any) {
      await this.showToast('Failed to initialize payment', 'danger');
    }
  }

  private handleCardChange(event: any) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError!.textContent = event.error.message;
    } else {
      displayError!.textContent = '';
    }
  }







  
  private loadCartItems() {
    // Example cart items for testing
    this.cartItems = [
      { name: 'Test Product 1', price: 29.99 },
      { name: 'Test Product 2', price: 39.99 }
    ];
    this.total = this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  async processPayment() {
    if (!this.paymentForm.valid || !this.stripe || !this.clientSecret) {
      alert("something missing");
       return;
    }

    this.processing = true;
    const loading = await this.loadingController.create({
      message: 'Processing payment...'
    });
    await loading.present();

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        this.clientSecret,
        {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.paymentForm.get('name')?.value,
              email: this.paymentForm.get('email')?.value
            }
          }
        }
      );

      if (error) {
        throw error;
      }

      await this.showToast('Payment successful!', 'success');
      this.router.navigate(['/order-confirmation']);
    } catch (error: any) {
      await this.showToast(error.message || 'Payment failed', 'danger');
    } finally {
      this.processing = false;
      await loading.dismiss();
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
