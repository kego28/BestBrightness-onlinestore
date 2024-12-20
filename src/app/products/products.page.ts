import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastController, IonSearchbar } from '@ionic/angular';
import { CartService } from '../services/cart.service';
import { PromotionService } from '../services/promotion.service'; 
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
interface Product {
  product_id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  total_ratings: number; // Track total number of ratings
  average_rating: number; // Track average rating
  isSale?: boolean;
  category: string;
  image_url: string; // Allow image_url to be optional
  quantity: number;
  stock_quantity: number;
  hasPromotion?: boolean;
  promotionName?: string;
  discountedPrice?: number;
  discount_percentage?: number;
  // description?: string; // Assuming you have a description
  showTooltip?: boolean; 
  rating: number;
}

interface Promotion {
  promotion_id: number;
  product_id: number;
  name: string;
  discount_percentage: number;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit,  OnDestroy {
  @ViewChild(IonSearchbar) searchbar!: IonSearchbar;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['All'];
  selectedCategory: string = 'All';
  sortOption: string = 'name';
  // userId: string | null = null;
  promotions: Promotion[] = [];
  searchTerm: any;
    userData:any;
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

  // userId: string | null = null;
  currentUserName: string | null = null;
  isLoggedIn: boolean = false;
  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private promotionService: PromotionService,
    private router: Router,
    // private router: Router,
    // private toastController: ToastController,
  ) {}

  ngOnInit() {
    // this.getUserName();
    this.loadProducts();
    this.getUserId();
    this.loadPromotions();
    this.getUserRole();

    this.applyPromotions();

  
    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {
      this.currentUser = navigation.extras.state['user'] || null; // Access user data
      console.log('Current User in Products:', this.currentUser);
    } else {
      console.log('No user data found in Products page.');
    }
  }
  ngOnDestroy() {
    // this.getUserName();
  }

  ionViewWillEnter() {
    this.getUserId();
  }
  getStarRating(rating: number): string {
    const fullStar = '★';
    const emptyStar = '☆';
    const roundedRating = Math.round(rating);
    return fullStar.repeat(roundedRating) + emptyStar.repeat(5 - roundedRating);
  }

  getRatingStars(rating: number): string[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 'star' : 'star-outline');
  }


  
  
  // getUserName() {
  //   this.currentUserName = sessionStorage.getItem('username');
  
  //   console.log('Logged-in user:', this.currentUserName); // Optional: To check if the name is correctly retrieved
  // }

  searchProducts() {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  getUserId() {
    // this.userId = sessionStorage.getItem('userId');
    // this.currentUserName = sessionStorage.getItem('username');

    const userData = {
      email: sessionStorage.getItem('userEmail'),
      role: sessionStorage.getItem('userRole'),
      userId: sessionStorage.getItem('userId'),
      username: sessionStorage.getItem('username')
  };

    if (!userData) {
      console.warn('User is not logged in');
    }
    else{
      this.userData = userData;
      this. currentUserName = this.userData.username;
      this.getUserRole();
    }



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
  async viewCart(){
 await  this.tocart();
  }
  async tocart() {

    console.log('Stored userId in sessionStorage:', this.userData.userId);  // Log the userId to check
    if (this.userData.userId) {
      this.router.navigate(['/cart']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to log in to view your account', 'warning');
    
    }
  }



// ngOnInit() {
//   this.getUserId();
//   this.getUserRole(); // Retrieve and set role

//   const navigation = this.router.getCurrentNavigation();
//   if (navigation?.extras.state) {
//     this.currentUser = navigation.extras.state['user'] || null; // Access user data
//     console.log('Current User in Products:', this.currentUser);
//   } else {
//     console.log('No user data found in Products page.');
//   }
// }


  getStockStatus(product: Product): string {
    if (product.stock_quantity < 1) {
      return 'Out of stock';
    } else if (product.stock_quantity > 10) {
      return 'In stock';
    } else if (product.stock_quantity <  10 && product.stock_quantity > 0) {

      return 'Running low on stock';
    }
    return '';
  }
  

  // Fetch products from MySQL
  loadProducts() {
    this.http.get<Product[]>('http://localhost/user_api/products.php').subscribe({
      next: (data: Product[]) => {
        this.products = data.map(product => ({ ...product, quantity: 1 }));
        this.filteredProducts = this.products;
        this.showTooltip =  false;
        this.applyFilters();
        this.loadPromotions();
        this.extractCategories();
        console.log('Products loaded:', this.products);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadPromotions() {
    this.promotionService.getPromotions().subscribe({
      next: (promotions: Promotion[]) => {
        this.promotions = promotions.map(promo => ({
          ...promo,
          discount_percentage: this.ensureValidNumber(promo.discount_percentage)
        }));
        this.applyPromotions();
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
      }
    });
  }

  applyPromotions() {
    this.products.forEach(product => {
      const promotion = this.promotions.find(p => p.product_id === product.product_id);
      if (promotion) {
        const discountAmount = product.price * (promotion.discount_percentage / 100);
        product.discountedPrice = this.roundToTwo(product.price - discountAmount);
        product.hasPromotion = true;
        product.promotionName = promotion.name;
      } else {
        product.discountedPrice = product.price;
        product.hasPromotion = false;
        product.promotionName = undefined;
      }
    });
    this.applyFilters(); // Re-apply filters to update displayed data
  }

  ensureValidNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }


  // Extract categories from products for the category filter
  extractCategories() {
    this.categories = ['All', ...new Set(this.products.map(product => product.category))];
  }

  // Method to handle product rating and update total_ratings and average_rating
  rateProduct(product: Product, rating: number) {
    const updatedProduct = { ...product };
    const newTotalRatings = updatedProduct.total_ratings + 1;
    const newAverage_rating = ((updatedProduct.average_rating * updatedProduct.total_ratings) + rating) / newTotalRatings;

    // Send the rating to the back-end
    this.http.post(`http://localhost/user_api/rate_product.php`, {
      product_id: product.product_id,
      rating: rating
    }).subscribe({
      next: (response) => {
        // Update product total_ratings and average locally
        updatedProduct.total_ratings = newTotalRatings;
        updatedProduct.average_rating = newAverage_rating;

        // Update locally without refreshing the entire page
        this.products = this.products.map(p => p.product_id === updatedProduct.product_id ? updatedProduct : p);
        this.applyFilters(); // Re-apply filters to update displayed data
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error rating product:', error);
      }
    });
  }

  // Search for products based on search term
  // searchProducts() {
  //   this.applyFilters();
  // }

  // Filter products by category
  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Sort products by the selected option
  sortProducts(option: string) {
    this.sortOption = option;
    this.applyFilters();
  }

  // Apply search, category filter, and sorting to the product list
  applyFilters() {
    const searchTerm = this.searchbar?.value?.toLowerCase() || '';

    // Filter products by search term, category, and stock
    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm);
      const matchesCategory = this.selectedCategory === 'All' || product.category === this.selectedCategory;
      const hasStock = product.stock_quantity > 0;

      // Show product if it matches the search term (regardless of stock) or if it has stock and matches the category
      return matchesSearch || (hasStock && matchesCategory);
    });
    // Sort products
    switch (this.sortOption) {
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_low_high':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_low':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.average_rating - a.average_rating);
        break;
    }
  }

  // Add product to cart and show a toast notification
  increaseQuantity(product: Product) {
    if (product.quantity) {
      product.quantity++;
    } else {
      product.quantity = 1;
    }
  }

  decreaseQuantity(product: Product) {
    if (product.quantity && product.quantity > 1) {
      product.quantity--;
    } else {
      product.quantity = 1;
    }
  }

  async addToCart(product: Product) {
    if (!this.userData.userId) {
      const toast = await this.toastController.create({
        message: 'Please log in to add items to your cart',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    if (!product.quantity || product.quantity < 1) {
      product.quantity = 1;
    }
  
    this.cartService.addToCart(product);
    
    const payload = {
      user_id: this.userData .userId,
      product_id: product.product_id,
      quantity: product.quantity
    };
    
    this.cartCount++;

    console.log('Sending request to add to cart:', payload);
  
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    try {
      const response: any = await this.http.post('http://localhost/user_api/cart.php', payload, { headers, observe: 'response' }).toPromise();
      
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
      console.log('Product added to cart successfully');
  
      const toast = await this.toastController.create({
        message: `${product.quantity} ${product.name}(s) added to cart`,
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
  
      // Reset quantity to 1 after adding to cart
      product.quantity = 1;
    } catch (error: any) {
      console.error('Error adding product to cart:', error);
      if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
      } else {
        console.error(`Backend returned code ${error.status}, body was:`, error.error);
      }
      
      const errorToast = await this.toastController.create({
        message: 'Error adding product to cart. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      errorToast.present();
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
}
