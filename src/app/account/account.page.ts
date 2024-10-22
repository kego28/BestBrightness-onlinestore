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
  

//   async logout() {
//     sessionStorage.removeItem('userId');
//     this.isLoggedIn = false;
//     this.currentUser = null;
//     await this.presentToast('You have logged out successfully', 'success');
//     this.router.navigate(['/login']);
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
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  order_type: string;
  status: string;
  created_at: string;
  updated_at: string;
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

  totalOrders: number = 0;
  loyaltyPoints: number = 0;
  wishlistItems: number = 0;

  private apiUrl = 'http://localhost/user_api/login.php';
  private ordersApiUrl = 'http://localhost/user_api/orders.php';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController,
    private formBuilder: FormBuilder
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

  ngOnInit() {
    this.getUserId();
  }

  async getUserId() {
    this.userId = sessionStorage.getItem('userId');
    console.log('Stored userId in sessionStorage:', this.userId);
    if (!this.userId) {
      this.router.navigate(['/home']);
      this.isLoggedIn = false;
      await this.presentToast('You need to log in to view your account', 'warning');
      this.router.navigate(['/login']);
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

  private fetchOrders() {
    if (!this.userId) return;
  
    this.ordersLoading = true;
    this.http.get<{ orderData: Order[] }>(`${this.ordersApiUrl}?user_id=${this.userId}`).subscribe({
      next: async (response) => {
        console.log('Raw API response:', response);
        this.allOrders = response.orderData;
        this.totalOrders = this.allOrders.length;
        this.filterOrders();
        this.ordersLoading = false;
        
        if (this.allOrders.length === 0) {
          this.ordersError = 'No orders found for this user';
          await this.presentToast('No orders found', 'warning');
        } else {
          await this.presentToast('Orders loaded successfully', 'success');
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
    this.router.navigate(['/home']);
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