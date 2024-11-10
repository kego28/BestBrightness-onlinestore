import { Component, OnInit,AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { DataService } from '../services/data.service'; // Import the dataService
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}
export interface Product {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  image_url: string;
}


interface Order {
  orderNumber: string;
  user_id: string;
  total_amount: number;
  order_type: 'online' | 'in-store' | 'pickup';
  status: 'pending' | 'completed' | 'canceled';
  created_at: Date;
  updated_at: Date;
  number_of_items: number;
}
interface User {
  user_id: number;      
  username: string;    
  email: string;        
  first_name: string;   
  last_name: string;    
  role: string;         
  created_at: string;   
  updated_at: string;   
}

@Component({
  selector: 'app-admin-custemer-orders',
  templateUrl: './admin-custemer-orders.page.html',
  styleUrls: ['./admin-custemer-orders.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCustemerOrdersPage implements OnInit, AfterViewInit{

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order = {
    orderNumber:'',
    user_id: '',
    total_amount: 0,
    order_type: 'online',
    status: 'pending',
    created_at: new Date(),
    updated_at:new Date(),
    number_of_items: 0
      };
  items:Product[]=[];
  segment = 'details';
  searchTerm = '';
  customerSince: string = '';
  userData:User;

  userId: number = 3;
  value: number =0 ;
  orderSize: number =0;
  constructor(
    private route: ActivatedRoute,
    private alertController: AlertController,
    private dataService: DataService,
    private cdr: ChangeDetectorRef ,
    private activatedRoute: ActivatedRoute
  ) {

    this.userData={
      user_id: 0,    
      username: '',    
      email: '',       
      first_name: '',  
      last_name: '',    
      role: '',        
      created_at: '',   
      updated_at: ''
    };
  }

 
    

    ngAfterViewInit(): void {

    }
  


   
    
    

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const value = params['value'];
      this.getCustomerData(value);
      console.log(value);  // The passed value
    });
    }
    getCustomerData(userId:number){
      this.dataService.getUserById(userId).subscribe({
        next: (data) => {
          this.userData = data;
      
          this.calculateCustomerSince();
          this.getOrder(this.userData.user_id);
          console.log('User data:', data);
          
          // Trigger change detection to ensure the view updates
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
        }
      });
     
    }
roundToDecimalPlaces(num: number, decimals: number): number {
      const factor = Math.pow(10, decimals);
     
      return Math.round(num * factor) / factor;
    }
  getOrder(userid: number){

    this.dataService.getOrdersByUserId(userid).subscribe(
      (data) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
        this.calculateLifetimeValue();
        this.orderSize = this.orders.length;
        this.cdr.detectChanges();
        console.log(JSON.stringify(this.filteredOrders));
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );
  }
   async orderProducts(orderNumber:string){
    await this.dataService.getOrderProducts(orderNumber).subscribe({
      next: (data) => {
        this.items = data;
        console.log('Product details:', this.items);
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
   
  }

  calculateCustomerSince() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const joinDate = new Date(this.userData.created_at);
    const month = months[joinDate.getMonth()];
    const year = joinDate.getFullYear();
    this.customerSince = `${month} ${year}`;
  }

  calculateLifetimeValue(): number {
    if (!this.orders || this.orders.length === 0) {
        console.log("No orders available to calculate lifetime value.");
        return 0;
    }

    let total = this.orders.reduce((accumulator, order) => {
        // Convert order amount to number explicitly
        const orderAmount = this.stringToInt(order.total_amount) || 0;
        console.log(`Adding order amount: ${orderAmount}`);  // Debug line
        return accumulator + orderAmount;
    }, 0);
    this.value = total
    console.log(`Total lifetime value: ${total}`);
       // Trigger change detection to ensure the view updates
       this.cdr.detectChanges();
    return parseFloat(total.toFixed(2));
}
  
stringToInt(str: any): number {
  const result = +str;
  if (isNaN(result)) {
    console.error('Invalid input, unable to convert to integer.');
    return 0; // or handle the error as needed
  }
  return result;
}

  
  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  filterOrders() {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.orders];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order =>
      order.orderNumber.toString().includes(searchTermLower) ||
      order.status.toLowerCase().includes(searchTermLower) 
      // order.items.some((item: { name: string; }) => item.name.toLowerCase().includes(searchTermLower))
    );
  }

  viewOrderDetails(order: Order) {
    this.orderProducts(order.orderNumber);
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = {
     
        orderNumber:'',
        user_id: '',
        total_amount: 0,
        order_type: 'online',
        status: 'pending',
        created_at: new Date(),
        updated_at:new Date(),
        number_of_items: 0
      };

  }

  // calculateSubtotal(items: OrderItem[] | undefined): number {
  //   if (!items) return 0;
  //   return items.reduce((total, item) => total + item.subtotal, 0);
  // }

  // calculateTax(items: OrderItem[] | undefined): number {
  //   const subtotal = this.calculateSubtotal(items);
  //   return subtotal * 0.08; // 8% tax rate - adjust as needed
  // }
// Use Product instead of OrderItem
calculateSubtotal(items: Product[] | undefined): number {
  return items ? items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
}

calculateTax(items: Product[] | undefined): number {
  const taxRate = 0.15; // Adjust tax rate as needed
  const subtotal = this.calculateSubtotal(items);
  return subtotal * taxRate;
}

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Information',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
