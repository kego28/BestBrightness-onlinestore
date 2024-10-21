// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { ToastController, AlertController } from '@ionic/angular';

// interface User {
//   user_id: number;
//   username: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   role: string;
// }

// @Component({
//   selector: 'app-admin-customer-management',
//   templateUrl: './admin-customer-management.page.html',
//   styleUrls: ['./admin-customer-management.page.scss'],
// })
// export class AdminCustomerManagementPage implements OnInit {
//   users: User[] = [];

//   searchQuery: string = '';
//   selectedFilter: string = '';

//   filteredUsers: any[] = [];

//   constructor(
//     private http: HttpClient,
//     private toastController: ToastController,
//     private alertController: AlertController
//   ) {}

//   ngOnInit() {
//     this.loadCustomers();
//   }

//   loadCustomers() {
//     this.http.get<User[]>('http://localhost/user_api/register.php?role=customer')
//       .subscribe(
//         data => {
//           console.log('Fetched customers:', data);
//           this.users = data;
//           this.filterUsers();  // Apply filter after loading customers
//         },
//         (error: HttpErrorResponse) => {
//           console.error('Error fetching customers:', error);
//           this.presentToast('Error loading customers: ' + error.message, 'danger');
//         }
//       );
//   }

//   filterUsers() {
//     // Normalize the search query for easier matching
//     const search = this.searchQuery.toLowerCase();
  
//     // Apply search and role filter
//     this.filteredUsers = this.users.filter(user => {
//       const matchesSearch =
//         user.first_name.toLowerCase().includes(search) ||
//         user.last_name.toLowerCase().includes(search) ||
//         user.email.toLowerCase().includes(search) ||
//         user.role.toLowerCase().includes(search);
  
//       const matchesRole =
//         this.selectedFilter === '' || 
//         this.selectedFilter === 'all' || 
//         user.role.toLowerCase() === this.selectedFilter.toLowerCase();
  
//       return matchesSearch && matchesRole;
//     });
//   }
  

//   async editUser(user: User) {
//     const alert = await this.alertController.create({
//       header: 'Edit Customer',
//       inputs: [
//         { name: 'username', type: 'text', value: user.username, placeholder: 'Username' },
//         { name: 'first_name', type: 'text', value: user.first_name, placeholder: 'First Name' },
//         { name: 'last_name', type: 'text', value: user.last_name, placeholder: 'Last Name' },
//         { name: 'email', type: 'text', value: user.email, placeholder: 'Email' },
//         { name: 'role', type: 'text', value: user.role, placeholder: 'Role' }
//       ],
//       buttons: [
//         { text: 'Cancel', role: 'cancel' },
//         {
//           text: 'Save',
//           handler: (data) => {
//             this.http.put<{status: number, message: string}>(`http://localhost/user_api/register.php?user_id=${user.user_id}`, data)
//               .subscribe(
//                 async (response) => {
//                   if (response.status === 1) {
//                     await this.presentToast('Customer updated successfully', 'success');
//                     this.loadCustomers();
//                   } else {
//                     await this.presentToast('Update failed: ' + response.message, 'danger');
//                   }
//                 },
//                 async (error: HttpErrorResponse) => {
//                   console.error('Error during update:', error);
//                   await this.presentToast('Error during update: ' + error.message, 'danger');
//                 }
//               );
//           }
//         }
//       ]
//     });
//     await alert.present();
//   }

//   async deleteUser(user_id: number) {
//     const alert = await this.alertController.create({
//       header: 'Confirm Delete',
//       message: 'Are you sure you want to delete this customer?',
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel',
//           handler: () => {
//             console.log('Delete canceled');
//           }
//         },
//         {
//           text: 'Delete',
//           role: 'destructive',
//           handler: () => {
//             this.http.delete<{ status: number, message: string }>(`http://localhost/user_api/register.php?user_id=${user_id}`)
//               .subscribe(
//                 async (response) => {
//                   if (response.status === 1) {
//                     await this.presentToast('Customer deleted successfully', 'success');
//                     this.loadCustomers(); // Refresh the list after deletion
//                   } else {
//                     await this.presentToast('Deletion failed: ' + response.message, 'danger');
//                   }
//                 },
//                 async (error: HttpErrorResponse) => {
//                   console.error('Error during deletion:', error);
//                   await this.presentToast('Error during deletion: ' + error.message, 'danger');
//                 }
//               );
//           }
//         }
//       ]
//     });

//     await alert.present();
//   }

//   async presentToast(message: string, color: 'success' | 'danger') {
//     const toast = await this.toastController.create({
//       message: message,
//       duration: 2000,
//       color: color,
//       position: 'bottom'
//     });
//     toast.present();
//   }
// }







import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
}

@Component({
  selector: 'app-admin-customer-management',
  templateUrl: './admin-customer-management.page.html',
  styleUrls: ['./admin-customer-management.page.scss'],
})
export class AdminCustomerManagementPage implements OnInit {
  // Existing properties
  users: User[] = [];
  searchQuery: string = '';
  selectedFilter: string = '';
  filteredUsers: User[] = [];
 
  currentRole: 'all' | 'admin' | 'user' = 'all';


  // New properties
  private searchSubject = new BehaviorSubject<string>('');
  isLoading: boolean = false;
  stats: Stats = {
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0
  };
  sortField: keyof User = 'user_id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    // Initialize debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.searchQuery = searchTerm;
        this.filterUsers();
      });
  }

  ngOnInit() {
    this.loadCustomers();
  }
  getActiveUsers(): number {
    // return this.filteredUsers.filter(user => user?.status === 'active').length;
  return 5;}
  // Enhanced loadCustomers with loading state
  async loadCustomers() {
    const loading = await this.loadingController.create({
      message: 'Loading customers...',
      spinner: 'crescent'
    });
    await loading.present();

    this.http.get<User[]>('http://localhost/user_api/register.php?role=customer')
      .subscribe(
        data => {
          console.log('Fetched customers:', data);
          this.users = data;
          this.filterUsers();
          this.updateStats();
          loading.dismiss();
        },
        async (error: HttpErrorResponse) => {
          console.error('Error fetching customers:', error);
          await this.presentToast('Error loading customers: ' + error.message, 'danger');
          loading.dismiss();
        }
      );
  }

  // Enhanced filterUsers with sorting
  filterUsers() {
    const search = this.searchQuery.toLowerCase();
  
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search);
  
      const matchesRole =
        this.selectedFilter === '' || 
        this.selectedFilter === 'all' || 
        user.role.toLowerCase() === this.selectedFilter.toLowerCase();
  
      return matchesSearch && matchesRole;
    });

    // Apply sorting
    this.sortUsers();
  }

  // New method for sorting
  sortUsers() {
    this.filteredUsers.sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      return this.sortDirection === 'asc'
        ? (valueA > valueB ? 1 : -1)
        : (valueB > valueA ? 1 : -1);
    });
  }

  // New method to handle sort changes
  onSort(field: keyof User) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortUsers();
  }

  // New method to update stats
  updateStats() {
    this.stats.totalCustomers = this.users.length;
    this.stats.activeCustomers = this.users.filter(user => user.role === 'customer').length;
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    this.stats.newCustomersThisMonth = this.users.filter(user => {
      // Assuming there's a created_at field, adjust accordingly
      return new Date(user.user_id).getTime() > startOfMonth.getTime();
    }).length;
  }

  // Enhanced search handler for debouncing
  onSearchChange(event: any) {
    this.searchSubject.next(event.target.value);
  }

  // Existing editUser method
  async editUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Edit Customer',
      inputs: [
        { name: 'username', type: 'text', value: user.username, placeholder: 'Username' },
        { name: 'first_name', type: 'text', value: user.first_name, placeholder: 'First Name' },
        { name: 'last_name', type: 'text', value: user.last_name, placeholder: 'Last Name' },
        { name: 'email', type: 'text', value: user.email, placeholder: 'Email' },
        { name: 'role', type: 'text', value: user.role, placeholder: 'Role' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            this.http.put<{status: number, message: string}>(
              `http://localhost/user_api/register.php?user_id=${user.user_id}`,
              data
            ).subscribe(
              async (response) => {
                if (response.status === 1) {
                  await this.presentToast('Customer updated successfully', 'success');
                  this.loadCustomers();
                } else {
                  await this.presentToast('Update failed: ' + response.message, 'danger');
                }
              },
              async (error: HttpErrorResponse) => {
                console.error('Error during update:', error);
                await this.presentToast('Error during update: ' + error.message, 'danger');
              }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Existing deleteUser method
  async deleteUser(user_id: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this customer?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Delete canceled');
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.http.delete<{ status: number, message: string }>(
              `http://localhost/user_api/register.php?user_id=${user_id}`
            ).subscribe(
              async (response) => {
                if (response.status === 1) {
                  await this.presentToast('Customer deleted successfully', 'success');
                  this.loadCustomers();
                } else {
                  await this.presentToast('Deletion failed: ' + response.message, 'danger');
                }
              },
              async (error: HttpErrorResponse) => {
                console.error('Error during deletion:', error);
                await this.presentToast('Error during deletion: ' + error.message, 'danger');
              }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  // Existing presentToast method
  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // New method to export data
  exportCustomerData() {
    const csvContent = this.convertToCSV(this.filteredUsers);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Helper method for CSV conversion
  private convertToCSV(data: User[]): string {
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => 
      Object.values(obj).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    return header + rows;
  }









 

  // Load users - replace this with actual API call


  // Get count of active users
 

  // Get count of new users this month
  getNewUsers(): number {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // This is a placeholder - you'll need to add a created_at field to your User interface
    // and implement proper date comparison
    return this.filteredUsers.length > 0 ? Math.floor(this.filteredUsers.length * 0.2) : 0;
  }

  // Filter users by role
  filterByRole(role: 'all' | 'admin' | 'user') {
    this.currentRole = role;
    this.filterUsers();
  }

  // Filter users based on search query and role
  // filterUsers() {
  //   this.filteredUsers = this.users.filter(user => {
  //     const matchesSearch = this.searchQuery 
  //       ? (user.first_name + ' ' + user.last_name + user.email + user.user_id)
  //           .toLowerCase()
  //           .includes(this.searchQuery.toLowerCase())
  //       : true;

  //     const matchesRole = this.currentRole === 'all' 
  //       ? true 
  //       : user.role === this.currentRole;

  //     return matchesSearch && matchesRole;
  //   });
  // }



  // View user details
  viewDetails(user: User) {
    console.log('Viewing details for user:', user);
    // Implement your view details logic here
  }

  
}






