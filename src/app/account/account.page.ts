// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { ToastController } from '@ionic/angular';
// import { of } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';


// interface User {
//   user_id: number;
//   username: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   role: string;
// }

// interface Order {
//   order_id: number;
//   user_id: number;
//   total_amount: string;
//   order_type: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
// }

// @Component({
//   selector: 'app-account',
//   templateUrl: './account.page.html',
//   styleUrls: ['./account.page.scss'],
// })
// export class AccountPage implements OnInit {
//   activeSection: 'orders' | 'edit' | 'address' = 'orders';
//   accountForm: FormGroup;
//   addressForm: FormGroup;
//   isLoggedIn: boolean = false;
//   currentUser: User | null = null;
//   orders: Order[] = [];
//   userId: string | null = null;
//   loading: boolean = true;
//   ordersLoading: boolean = true;
//   error: string | null = null;
//   ordersError: string | null = null;
//   selectedStatus: string = 'all';
//   showAllOrders: boolean = false;
//   allOrders: Order[] = [];
//   displayedOrders: Order[] = [];
//   private apiUrl = 'http://localhost/user_api/login.php';
//   private ordersApiUrl = 'http://localhost/user_api/orders.php';

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private toastController: ToastController,
//     private formBuilder: FormBuilder
//   ) {
//     this.accountForm = this.formBuilder.group({
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       username: ['', Validators.required]
//     });

//     this.addressForm = this.formBuilder.group({
//       street: ['', Validators.required],
//       city: ['', Validators.required],
//       postalCode: ['', Validators.required]
//     });
//   }

//   ngOnInit() {
//     this.accountForm = this.formBuilder.group({
//       // Define form controls for accountForm
//       name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//     });

//     this.addressForm = this.formBuilder.group({
//       // Define form controls for addressForm
//       address: ['', Validators.required],
//       city: ['', Validators.required],
//     });
    
//     this.getUserId();
//   }

//   async getUserId() {
//     this.userId = sessionStorage.getItem('userId');
//     console.log('Stored userId in sessionStorage:', this.userId);  // Log the userId to check
//     if (!this.userId) {
//       this.isLoggedIn = false;
//       await this.presentToast('You need to log in to view your account', 'warning');
//       this.router.navigate(['/home']);
//       return;
//     }
    
//     this.fetchUserDetails();
//   }
  
//   private fetchUserDetails() {
//     if (!this.userId) return;

//     this.loading = true;
//     this.http.get<User>(`${this.apiUrl}?user_id=${this.userId}`).subscribe({
//       next: async (user) => {
//         this.currentUser = user;
//         this.isLoggedIn = true;
//         this.loading = false;
//         await this.presentToast('User details loaded successfully', 'success');
//         this.fetchOrders(); // Fetch orders after user details are loaded

//         // Populate the form with user data
//         this.accountForm.patchValue({
//           firstName: user.first_name,
//           lastName: user.last_name,
//           email: user.email,
//           username: user.username
//         });
        
//         await this.presentToast('User details loaded successfully', 'success');
//         this.fetchOrders();
//       },
//       error: async (error: HttpErrorResponse) => {
//         this.error = 'Failed to load user details';
//         this.loading = false;
        
//         let errorMessage = 'An error occurred while loading user details';
//         if (error.status === 404) {
//           errorMessage = 'User not found';
//         } else if (error.status === 0) {
//           errorMessage = 'Unable to connect to the server. Please check if the server is running.';
//         }
        
//         await this.presentToast(errorMessage, 'danger');
//         console.error('Error fetching user details:', error);
//       }
//     });
//   }

//   private fetchOrders() {
//     if (!this.userId) return;
  
//     this.ordersLoading = true;
//     this.http.get<{ orderData: Order[] }>(`${this.ordersApiUrl}?user_id=${this.userId}`).subscribe({
//       next: async (response) => {
//         console.log('Raw API response:', response);
//         this.allOrders = response.orderData;
//         this.filterOrders();
//         this.ordersLoading = false;
        
//         if (this.allOrders.length === 0) {
//           this.ordersError = 'No orders found for this user';
//           await this.presentToast('No orders found', 'warning');
//         } else {
//           await this.presentToast('Orders loaded successfully', 'success');
//         }
//       },
//       error: async (error: HttpErrorResponse) => {
//         this.ordersError = 'Failed to load orders';
//         this.ordersLoading = false;
        
//         let errorMessage = 'An error occurred while loading orders';
//         if (error.status === 404) {
//           errorMessage = 'Orders not found';
//         } else if (error.status === 0) {
//           errorMessage = 'Unable to connect to the server. Please check if the server is running.';
//         }
        
//         await this.presentToast(errorMessage, 'danger');
//         console.error('Error fetching orders:', error);
//       }
//     });
//   }

//   filterOrders() {
//     let filteredOrders = this.selectedStatus === 'all' 
//       ? this.allOrders 
//       : this.allOrders.filter(order => order.status === this.selectedStatus);
    
//     this.displayedOrders = this.showAllOrders ? filteredOrders : filteredOrders.slice(0, 3);
//   }

//   onStatusChange() {
//     this.showAllOrders = false;
//     this.filterOrders();
//   }

//   toggleShowAllOrders() {
//     this.showAllOrders = !this.showAllOrders;
//     this.filterOrders();
//   }

//   viewOrders() {
//     this.activeSection = 'orders';
//   }
//   editAccount() {
//     this.activeSection = 'edit';
//   }
// viewAddress() {
//   // Define the logic for viewAddress or leave it empty if not needed
//   console.log('viewAddress called');
// }

//   async updateAccount() {
//     if (this.accountForm.valid && this.currentUser) {
//       // Implement your account update API call here
//       const userData = {
//         user_id: this.currentUser.user_id,
//         ...this.accountForm.value
//       };
//       try {
//         // Add your API call here
//         await this.presentToast('Account updated successfully', 'success');
//       } catch (error) {
//         await this.presentToast('Failed to update account', 'danger');
//         console.error('Error updating account:', error);
//       }
//     }
//   }

//   async updateAddress() {
//     if (this.addressForm.valid && this.currentUser) {
//       try {
//         // Add your address update API call here
//         await this.presentToast('Address updated successfully', 'success');
//       } catch (error) {
//         await this.presentToast('Failed to update address', 'danger');
//         console.error('Error updating address:', error);
//       }
//     }
//   }
  



//   async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary') {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2000,
//       color,
//       position: 'bottom'
//     });
//     await toast.present();
//   }
// }
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Order {
  order_id: number;
  user_id: number;
  total_amount: string;
  quantity: string;
  order_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  orderNumber: string;
  name: string;
  price: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  activeSection: string = 'orders';
  accountForm: FormGroup;
  addressForm: FormGroup;
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  allOrders: Order[] = [];
  displayedOrders: Order[] = [];
  userId: string | null = null;
  loading: boolean = true;
  ordersLoading: boolean = true;
  error: string | null = null;
  ordersError: string | null = null;
  selectedStatus: string = 'all';
  showAllOrders: boolean = false;
  fetchedOrder: Order[] = []; 
  totalOrders: number = 0;
  loyaltyPoints: number = 53;
  wishlistItems: number = 16;
  orderIdInput: any;

  private apiUrl = 'http://localhost/user_api/login.php';
  private ordersUrl = 'http://localhost/user_api/orders.php';
  private ordersVirtualUrl = 'http://localhost/user_api/virtualOrder.php';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private alertController: AlertController
  ) {
    this.accountForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      // phone: ['', Validators.required]
    });

    this.addressForm = this.formBuilder.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }
  isMenuOpen = false;
  isScrolled = false;
  // currentUser:any;

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


  ngOnInit() {
    this.getUserId();
  }

  async viewAccount() {
    await this.toAccount();
  }

  async cashier() {
    const role = sessionStorage.getItem('userRole');
    this.userId = sessionStorage.getItem('userId');
    console.log('Stored userId in sessionStorage:', this.userId);  // Log the userId to check
    if (this.userId && role ==='cashier') {
      this.router.navigate(['/pos']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to login as cashier to access this page', 'warning');
    
    }
  }

  viewOrderDetails(orderNumber: string) {
    this.http.get<{ success: boolean; orders: any[] }>(`http://localhost/user_api/virtualOrder.php?orderNumber=${orderNumber}`)
      .subscribe({
        next: (response) => {
          console.log('API response:', response);

          if (response && response.success && Array.isArray(response.orders)) {
            this.fetchedOrder = response.orders;
            this.activeSection = 'vieworders';
            
            if (response.orders.length > 0) {
              this.showAlert('Order Details', `Viewing details for Order ${orderNumber}`);
            } else {
              this.showAlert('No Orders Found', 'No orders found with this number.');
            }
          } else {
            this.showAlert('Error', 'Invalid response from server.');
          }
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.showAlert('Error', 'Failed to fetch order details.');
        }
      });
  }

  backToOrders() {
    this.activeSection = 'orders';
    this.fetchedOrder = [];
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async admin() {
    this.userId = sessionStorage.getItem('userId');
    const role = sessionStorage.getItem('userRole');
    console.log('Stored userId in sessionStorage:', this.userId);  // Log the userId to check
    if (this.userId && role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to log in as admin to view admin pages', 'warning');
    
    }
  }
  async toAccount() {
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
  async viewCart(){
 await  this.tocart();
  }
  async tocart() {
    this.userId = sessionStorage.getItem('userId');
    console.log('Stored userId in sessionStorage:', this.userId);  // Log the userId to check
    if (this.userId) {
      this.router.navigate(['/cart']);
      this.isLoggedIn = false;
        
      return;
    }
    else{
      await this.presentToast('You need to log in to view your account', 'warning');
    
    }
  }

  async getUserId() {
    this.userId = sessionStorage.getItem('userId');
    console.log('Stored userId in sessionStorage:', this.userId);
    if (!this.userId) {
      this.router.navigate(['/products']);
      this.isLoggedIn = false;
      await this.presentToast('You need to log in to view your account', 'warning');
      // this.router.navigate(['/login']);
      return;
    }
    
    this.fetchUserDetails();
  }
  
  private fetchUserDetails() {
    if (!this.userId) return;

    this.loading = true;
    this.http.get<User>(`${this.apiUrl}?user_id=${this.userId}`).subscribe({
      next: async (user) => {
        this.currentUser = user;
        this.isLoggedIn = true;
        this.loading = false;
        
        this.accountForm.patchValue({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          username: user.username
        });
        
        await this.presentToast('User details loaded successfully', 'success');
        this.fetchOrders();
      },
      error: async (error: HttpErrorResponse) => {
        this.handleError(error, 'Failed to load user details');
      }
    });
  }

  // private fetchOrders() {
  //   if (!this.userId) return;
  
  //   this.ordersLoading = true;
  
  //   // Create observables for both API calls
  //   const ordersRequest = this.http.get<{ orderData: Order[] }>(`${this.ordersUrl}?user_id=${this.userId}`);
  //   const virtualOrdersRequest = this.http.get<{ success: boolean; orders: Order[] }>(`${this.ordersVirtualUrl}?user_id=${this.userId}`);
  
  //   // Use forkJoin to combine the results
  //   forkJoin([ordersRequest, virtualOrdersRequest]).subscribe({
  //     next: async ([ordersResponse, virtualOrdersResponse]) => {
  //       console.log('Orders Response:', ordersResponse);
  //       console.log('Virtual Orders Response:', virtualOrdersResponse);
  
  //       // Combine the order data from both responses
  //       this.allOrders = [...ordersResponse.orderData, ...virtualOrdersResponse.orders];
  //       this.totalOrders = this.allOrders.length;
  //       this.filterOrders();
  //       this.ordersLoading = false;
  
  //       if (this.allOrders.length === 0) {
  //         this.ordersError = 'No orders found for this user';
  //         await this.presentToast('No orders found', 'warning');
  //       } else {
  //         await this.presentToast('Orders loaded successfully', 'success');
  //       }
  //     },
  //     error: async (error: HttpErrorResponse) => {
  //       this.handleError(error, 'Failed to load orders');
  //       this.ordersLoading = false; // Ensure loading state is reset on error
  //     }
  //   });
  // }

  
  private fetchOrders() {
    if (!this.userId) return;
  
    this.ordersLoading = true;
    this.http.get<{ success: boolean; orders: Order[] }>(`${this.ordersVirtualUrl}?user_id=${this.userId}`).subscribe({
      next: async (response) => {
        console.log('Raw API response:', response);
  
        // Check if the response indicates success
        if (response.success) {
          // Use a Set to track unique orderNumbers
          const uniqueOrdersMap = new Map<string, Order>();
  
          // Iterate through the orders and store only unique ones
          response.orders.forEach(order => {
            if (!uniqueOrdersMap.has(order.orderNumber)) {
              uniqueOrdersMap.set(order.orderNumber, order);
            }
          });
  
          // Convert the map back to an array
          this.allOrders = Array.from(uniqueOrdersMap.values());
          this.totalOrders = this.allOrders.length;
          this.filterOrders();
          this.ordersLoading = false;
  
          if (this.allOrders.length === 0) {
            this.ordersError = 'No orders found for this user';
            await this.presentToast('No orders found', 'warning');
          } else {
            await this.presentToast('Orders loaded successfully', 'success');
          }
        } else {
          // Handle case where the response is not successful
          this.ordersError = 'Failed to load orders';
          // await this.presentToast(this.ordersError, 'error');
          this.ordersLoading = false;
        }
      },
      error: async (error: HttpErrorResponse) => {
        this.handleError(error, 'Failed to load orders');
      }
    });
  }
  
  

  filterOrders() {
    let filteredOrders = this.selectedStatus === 'all' 
      ? this.allOrders 
      : this.allOrders.filter(order => order.status.toLowerCase() === this.selectedStatus.toLowerCase());
    
    this.displayedOrders = this.showAllOrders ? filteredOrders : filteredOrders.slice(0, 10);
  }

  onStatusChange() {
    this.showAllOrders = false;
    this.filterOrders();
  }

  toggleShowAllOrders() {
    this.showAllOrders = !this.showAllOrders;
    this.filterOrders();
  }

  segmentChanged(event: CustomEvent) {
    this.activeSection = event.detail.value;
  }

  searchOrders(event: CustomEvent) {
    const searchTerm = event.detail.value.toLowerCase();
    this.displayedOrders = this.allOrders.filter(order => 
      order.order_id.toString().includes(searchTerm) ||
      order.total_amount.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm) ||
      order.created_at.toLowerCase().includes(searchTerm)
    );
  }

  loadMoreOrders(event: any) {
    setTimeout(() => {
      const currentLength = this.displayedOrders.length;
      const newOrders = this.allOrders.slice(currentLength, currentLength + 10);
      this.displayedOrders = [...this.displayedOrders, ...newOrders];
      event.target.complete();

      if (this.displayedOrders.length >= this.allOrders.length) {
        event.target.disabled = true;
      }
    }, 500);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processed':
      case 'order-processed':
        return 'primary';
      case 'shipped':
        return 'secondary';
      case 'delivered':
      case 'checked-out':
        return 'success';
      default:
        return 'medium';
    }
  }

  // async updateAccount() {
  //   if (this.accountForm.valid && this.currentUser) {
  //     const userData = {
  //       user_id: this.currentUser.user_id,
  //       ...this.accountForm.value
  //     };
  //     try {
  //       // Add your API call here



        
  //       await this.presentToast('Account updated successfully', 'success');
  //     } catch (error) {
  //       await this.presentToast('Failed to update account', 'danger');
  //       console.error('Error updating account:', error);
  //     }
  //   }
  // }
  async updateAccount() {
    if (this.accountForm.valid) {
      const formData = this.accountForm.value;
      const apiUrl = `http://localhost/user_api/register.php?user_id=${this.currentUser?.user_id}`;

      const updateData = {
        username: formData.username,  // Replace with actual data if needed
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role  // Or dynamically retrieve this value
      };

      try {
        await this.http.put(apiUrl, updateData).toPromise();
        await this.presentToast('Account updated successfully', 'success');
      } catch (error) {
        await this.presentToast('Failed to update account', 'danger');
        console.error('Error updating account:', error);
      }
    }
  }



  async updateAddress() {
    if (this.addressForm.valid && this.currentUser) {
      try {
        // Add your address update API call here
        await this.presentToast('Address updated successfully', 'success');
      } catch (error) {
        await this.presentToast('Failed to update address', 'danger');
        console.error('Error updating address:', error);
      }
    }
  }

  async logout() {
    sessionStorage.removeItem('userId');
    this.isLoggedIn = false;
    this.currentUser = null;
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

  private handleError(error: HttpErrorResponse, defaultMessage: string) {
    let errorMessage = defaultMessage;
    if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check if the server is running.';
    }
    
    this.presentToast(errorMessage, 'danger');
    console.error('Error:', error);
    this.loading = false;
    this.ordersLoading = false;
  }
}