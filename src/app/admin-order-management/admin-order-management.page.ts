import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, IonModal } from '@ionic/angular';
import { catchError, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ChartDataService } from '../services/chart-data.service';
import { Chart } from 'chart.js'

interface UpdateResponse {
  success: boolean;
  message?: string; // Optional, in case there's no message
}


@Component({
  selector: 'app-admin-order-management',
  templateUrl: './admin-order-management.page.html',
  styleUrls: ['./admin-order-management.page.scss'],
})
export class AdminOrderManagementPage implements OnInit {
  @ViewChild('updateStatusModal') updateStatusModal!: IonModal;
  @ViewChild('viewOrderModal') viewOrderModal!: IonModal;

  currentOrderDetails: any = null;
  orderData: any[] = [];
  selectedStatus: string = '';
  currentOrder: any = null;
  searchTerm: string = '';
  filterType: string = '';
  filterValue: string = '';
  filteredOrderData: any[] = [];

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController,
    private chartDataService: ChartDataService
  ) {}

  ngOnInit() {
    this.fetchOrders();
    this.loadInventoryCharts();
  }

  fetchOrders() {
    const ordersRequest = this.http.get<{ orderData: any[] }>('http://localhost/user_api/orders.php');
    const virtualOrdersRequest = this.http.get<{ success: boolean; orders: any[] }>('http://localhost/user_api/virtualOrder.php');
  
    forkJoin([ordersRequest, virtualOrdersRequest])
      .pipe(
        tap(([response1, response2]) => {
          console.log('Fetched orders from orders.php:', response1.orderData);
          console.log('Fetched orders from virtualOrder.php:', response2.orders);
        }),
        catchError(error => {
          console.error('Error fetching orders:', error);
          this.presentToast('Failed to fetch orders', 'danger');
          return of([{ orderData: [] }, { success: false, orders: [] }]); // Return default empty values
        })
      )
      .subscribe(([response1, response2]) => {
        this.orderData = response1.orderData ?? []; // Use default empty array if undefined
  
        if (response2.success) {
          const virtualOrders = response2.orders;
  
          // Combine orders
          this.orderData = [...this.orderData, ...virtualOrders]; // Combine both arrays
          this.filteredOrderData = [...this.orderData]; // Initialize filtered data
        }
      });
  }
  
  
  
  
  
    
  
    loadInventoryCharts() {
      // Product Ratings Chart
      this.chartDataService.getChartData('product_ratings').subscribe(data => {
        const products = data.map((item: any) => item.name);
        const ratings = data.map((item: any) => item.average_rating);
  
        new Chart('productRatingsChart', {
          type: 'bar',
          data: {
            labels: products,
            datasets: [{
              label: 'Average Rating',
              data: ratings,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      });
  
      // Promotions Usage Chart
      this.chartDataService.getChartData('promotions_usage').subscribe(data => {
        const promotionStatus = data.map((item: any) => item.promotion_status);
        const orderCounts = data.map((item: any) => item.total_orders);
  
        new Chart('promotionsUsageChart', {
          type: 'pie',
          data: {
            labels: promotionStatus,
            datasets: [{
              data: orderCounts,
              backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'top' }
            }
          }
        });
      });
    }
  
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  applyFilters() {
    this.filteredOrderData = this.orderData.filter(order => {
      const matchesSearch = this.searchTerm ? order.order_id.toString().includes(this.searchTerm) : true;
      let matchesFilter = true;

      if (this.filterType === 'status' && this.filterValue) {
        matchesFilter = order.status.toLowerCase() === this.filterValue.toLowerCase();
      } else if (this.filterType === 'date' && this.filterValue) {
        const orderDate = new Date(order.created_at).toDateString();
        const filterDate = new Date(this.filterValue).toDateString();
        matchesFilter = orderDate === filterDate;
      }

      return matchesSearch && matchesFilter;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.applyFilters();
  }

  onFilterTypeChange(event: any) {
    this.filterType = event.detail.value;
    this.filterValue = ''; // Reset filter value when type changes
    this.applyFilters();
  }

  onFilterValueChange(event: any) {
    this.filterValue = event.detail.value;
    this.applyFilters();
  }

  async viewOrderDetails(order: any) {
    this.http.get(`http://localhost/user_api/orders.php?id=${order.order_id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching order details:', error);
          this.presentToast('Failed to fetch order details', 'danger');
          return of(null); // Return null on error
        })
      )
      .subscribe((response: any) => {
        if (response.success) {
          this.currentOrderDetails = response.order;
          this.viewOrderModal.present();
        } else {
          this.presentToast(response.message || 'Failed to fetch order details', 'danger');
        }
      });
  }

  async openUpdateStatusModal(order: any) {
    this.currentOrder = order;
    this.selectedStatus = order.status;
    this.updateStatusModal.present();
  }

  updateOrderStatus() {
    if (!this.currentOrder || !this.selectedStatus) {
      console.error('Validation Error:', {
        currentOrder: this.currentOrder,
        selectedStatus: this.selectedStatus
      });
      this.presentToast('Please select a status', 'danger');
      return;
    }
  
    const updateData = {
      status: this.selectedStatus,
      previousStatus: this.currentOrder.status
    };
  
    this.http.put<UpdateResponse>(`http://localhost/user_api/orders.php?id=${this.currentOrder.order_id}`, updateData)
      .pipe(
        tap(response => {
          console.log('Update response:', response);
        }),
        catchError(error => {
          console.error('Error updating order status:', error);
          this.presentToast('Failed to update order status', 'danger');
          return of(null); // Return null on error
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.presentToast('Order status updated successfully', 'success');
          this.fetchOrders(); // Refresh the list of orders
          this.updateStatusModal.dismiss();
        } else {
          this.presentToast(response?.message || 'Failed to update order status', 'danger');
        }
      });
  }
  

  async deleteOrder(order: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this order?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.http.delete(`http://localhost/user_api/orders.php?id=${order.order_id}`)
              .pipe(
                catchError(error => {
                  console.error('Error deleting order:', error);
                  this.presentToast('Failed to delete order', 'danger');
                  return of(null); // Return null on error
                })
              )
              .subscribe((response: any) => {
                if (response && response.success) {
                  this.presentToast('Order deleted successfully', 'success');
                  this.fetchOrders(); // Refresh the list of orders
                } else {
                  this.presentToast(response.message || 'Failed to delete order', 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  private async presentToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
