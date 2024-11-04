import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, LoadingController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';
import emailjs from 'emailjs-com';

import { ModalController, Platform } from '@ionic/angular';
interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.page.html',
  styleUrls: ['./admin-user-management.page.scss'],
})
export class AdminUserManagementPage implements OnInit {
  @ViewChild(IonModal) addUserModal!: IonModal; // Using ! to ensure the modal is initialized

  // Form fields
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  role: string = 'cashier'; // Default role

  // Roles for the role selector
  roles = [
    { value: 'cashier', label: 'Cashier' },
    { value: 'admin', label: 'Admin' }
  ];

  // Search and filter variables
  searchQuery: string = '';
  selectedFilter: string = this.roles[1].value;


  users: any[] = [];
  filteredUsers: any[] = [];


  // searchQuery: string = '';
  // selectedFilter: string = 'all';
  // filteredUsers: any[] = [];
  isHeaderScrolled: boolean = false;
  isSmallScreen: boolean = false;
  // addUserModal: any;
  isMenuOpen: boolean = false;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,


    
      private modalController: ModalController,
      private platform: Platform
    
  ) {}

  ngOnInit() {
    this.fetchUsers();
    this.filterUsers();
    this.isSmallScreen = this.platform.width() < 768;
    this.platform.resize.subscribe(() => {
      this.isSmallScreen = this.platform.width() < 768;
    });
  }
  onContentScroll(event: any) {
    this.isHeaderScrolled = event.detail.scrollTop > 50;
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  // filterUsers() {
  //   this.filteredUsers = this.users.filter(user => {
  //     const matchesSearch = user.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
  //                           user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
  //                           user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      
  //     const matchesFilter = this.selectedFilter === 'all' || user.role === this.selectedFilter;
      
  //     return matchesSearch && matchesFilter;
  //   });
  // }
  // async presentAddUserModal() {
  //   this.addUserModal = await this.modalController.create({
  //     component: AddUserModalComponent,
  //     cssClass: 'add-user-modal'
  //   });
  //   await this.addUserModal.present();

  //   const { data } = await this.addUserModal.onWillDismiss();
  //   if (data) {
  //     this.addNewUser(data);
  //   }
  // }

  // dismissModal() {
  //   if (this.addUserModal) {
  //     this.addUserModal.dismiss();
  //   }
  // }

  // Method to open the modal
  async presentAddUserModal() {
    await this.addUserModal?.present();
  }

  // Method to close the modal
  dismissModal() {
    this.addUserModal?.dismiss();
  }

  // Method to handle form submission
  async submitForm() {
    if (this.firstName && this.lastName && this.email) {
      const username = this.generateUsername();
      const newUser = {
        username: username,
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        password: username,
        role: this.role
      };
console.log(newUser.password);
      this.http.post<{status: number, message: string, user_id: number}>('http://localhost/user_api/register.php', newUser)
        .subscribe(async (response) => {
          if (response.status === 1) {
            await this.presentToast('User added successfully', 'success');
            this.dismissModal();
            this.clearForm();
            this.fetchUsers();
            
            // Send email to the new user
            await this.Send(newUser, response.user_id);
          } else {
            await this.presentToast('Error: ' + response.message, 'danger');
          }
        });
    } else {
      await this.presentToast('Please fill all the fields', 'danger');
    }
  }




  async Send(user: any, userId: number): Promise<void> {
    if (!user.email) {
      this.showToast('Recipient email address is empty');
      return;
    }
   
  
    // Construct the receipt message in plain text format
    let message = `
    Dear ${user.first_name} ${user.last_name},

    Welcome to our system! Your account has been created successfully.

    Here are your account details:
    Username: ${user.username}
    Role: ${user.role}
    Email: ${user.email}

    Your password is the same as the username, please login to the system to change to a safer and secure password.

    Please keep this information safe. You can use your username to log in to the system.

    If you have any questions or need assistance, please don't hesitate to contact us.

    Best regards,
    The Admin Team
  `;
  
    // EmailJS email parameters
    const emailParams = {
      email_to: user.email,
      subject: 'Welcome to Best Brightness Sysytem',
      message: message, // Set the receipt message as the email body (plain text format)
    };



  
    // Show loading indicator
    const loader = await this.loadingController.create({
      message: 'Sending Email...',
      cssClass: 'custom-loader-class'
    });
  
    await loader.present();
  
    try {
      // Send email using EmailJS
      await emailjs.send('service_enj4mb1','template_zr0xpch', emailParams, 'wbYhGj7VnQN_l3bm5');
      this.showToast('Email successfully sent');
      alert('Email successfully sent');
    } catch (error) {
      this.showToast('Error sending email: ' + error);
      alert('Error sending email');
    } finally {
      await loader.dismiss();
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  // Method to present a toast
  async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // Method to generate a username based on the role
  generateUsername(): string {
    const prefix = this.role === 'admin' ? 'admin' : 'cashier';
    return prefix + Math.floor(1000 + Math.random() * 9000); // Generates random 4-digit number for uniqueness
  }

  // Clear form fields after submission
  clearForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.role = 'cashier'; // Reset role to default
  }

  // Method to fetch users based on selected filter
  fetchUsers() {
    const role = this.selectedFilter;

    this.http.get<any[]>(`http://localhost/user_api/register.php?role=${role}`)
      .subscribe((response) => {
        if (Array.isArray(response)) {
          this.users = response;
          this.filterUsers();
        } else {
          this.presentToast('Error fetching users', 'danger');
        }
      }, (error) => {
        this.presentToast('Error fetching users', 'danger');
      });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRole = this.selectedFilter === 'all' || user.role.toLowerCase() === this.selectedFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }

  // Method to delete a user
  deleteUser(userId: number) {
    this.http.delete<{status: number, message: string}>(`http://localhost/user_api/register.php?user_id=${userId}`)
      .subscribe(async (response) => {
        if (response.status === 1) {
          await this.presentToast('User deleted successfully', 'success');
          this.fetchUsers(); // Refresh user list
        } else {
          await this.presentToast('Error: ' + response.message, 'danger');
        }
      });
  }

  // Method to edit a user
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
            this.http.put<{status: number, message: string}>(`http://localhost/user_api/register.php?user_id=${user.user_id}`, data)
              .subscribe(
                async (response) => {
                  if (response.status === 1) {
                    await this.presentToast('Customer updated successfully', 'success');
                    this.fetchUsers();
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
}
