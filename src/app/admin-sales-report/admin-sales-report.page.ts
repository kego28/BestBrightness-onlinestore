import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChartDataService } from '../services/chart-data.service';
import { Chart } from 'chart.js';

interface Product {
  product_id: number;
  name: string;
  category: string;
  stock_quantity: number;
  barcode: string;
  description: string;
  price: number;
  image_url: string;
  additional_images?: string[];
  sales_count?: number;         // Number of units sold
  last_sale_date?: Date;        // Date of last sale
  movement_rate?: number;       // Calculated movement rate
  movement_category?: 'fast' | 'medium' | 'slow'; // Classification
}

@Component({
  selector: 'app-admin-sales-report',
  templateUrl: './admin-sales-report.page.html',
  styleUrls: ['./admin-sales-report.page.scss'],
})
export class AdminSalesReportPage implements OnInit {
  salesData: any[] = [];
  displayedSalesData: any[] = []; // Data shown on the current page
  
  products: Product[] = [];
  fastMoving: Product[] = [];

  totalSalesAmount: number = 0;
  totalOrders: number = 0;
  averageOrderValue: number = 0;
  topProduct: string = ''; // Placeholder, replace with actual logic

  summaryCards: any[] = [];
  pageSize: number = 5; // Items per page
  currentPage: number = 1; // Current page
  totalPages: number = 0; // Total number of pages

  constructor(private http: HttpClient,private chartDataService: ChartDataService) {}

  ngOnInit() {
   
    this.loadProducts();
    this.fetchSalesData();
    this.loadSalesCharts();
  }

  fetchSalesData() {
    this.http.get<{ salesData: any[], totalSalesAmount: number }>('http://localhost/user_api/sales.php')
      .subscribe(response => {
        this.salesData = response.salesData;

        this.totalSalesAmount = response.totalSalesAmount;
        this.totalOrders = this.salesData.length;
        this.calculateAverageOrderValue();
        this.updateSummaryCards();

        this.totalPages = Math.ceil(this.totalOrders / this.pageSize);
 
        this.updateDisplayedSales();
      });
  }
  updateDisplayedSales() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedSalesData = this.salesData.slice(startIndex, startIndex + this.pageSize);
  }
  calculateAverageOrderValue() {
    if (this.totalOrders > 0) {
      this.averageOrderValue = this.totalSalesAmount / this.totalOrders;
    } else {
      this.averageOrderValue = 0;
    }
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost/user_api/products.php')
      .subscribe(
        data => {
          this.products = data;
          console.log(this.products);
          this.updateProductLists();
        },
        (error: HttpErrorResponse) => {
          console.error('Error fetching products:', error);
          // this.presentToast('Error loading products: ' + error.message, 'danger');
        }
      );
  }







 



  loadSalesCharts() {
    // Sales by Payment Method Chart

    setTimeout(() => {
    this.chartDataService.getChartData('sales_by_payment_method').subscribe((data: any[]) => {
      const methods = data.map((item: any) => item.payment_method);
      const salesCounts = data.map((item: any) => item.total_sales);

      new Chart('salesPaymentMethodChart', {
        type: 'pie',
        data: {
          labels: methods,
          datasets: [{
            data: salesCounts,
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)'],
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

    // Top Selling Products Chart
    this.chartDataService.getChartData('top_selling_products').subscribe((data: any[]) => {
      const products = data.map((item: any) => item.name);
      const quantities = data.map((item: any) => item.total_quantity_sold);

      new Chart('topSellingProductsChart', {
        type: 'bar',
        data: {
          labels: products,
          datasets: [{
            label: 'Units Sold',
            data: quantities,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
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
    }); }, 150); 
  }

  updateProductLists() {
    // Convert stock_quantity to a number for sorting
    const sortedProducts = [...this.products].sort((a, b) => Number(b.stock_quantity) - Number(a.stock_quantity));
  
    // Get the top 5 fast-moving products
    this.fastMoving = sortedProducts.slice(0, 5);
  
    // Ensure there are fast-moving products before accessing them
    if (this.fastMoving.length > 0) {
      this.topProduct = this.fastMoving[0].name;
  
      // Log the product name if it exists
      if (this.topProduct) {
        console.log(this.topProduct);
      } else {
        console.log('Top product has no name.');
      }
    } else {
      console.log('No fast-moving products available.');
    }
  }
  
  

  updateSummaryCards() {
    const targetSales = 10000;
    const targetOrders = 100;
    const targetAvgOrderValue = 10000;

    this.summaryCards = [
      {
        title: 'Total Sales',
        value: `R${this.totalSalesAmount.toFixed(2)}`,
        icon: 'cash-outline',
        percent: Math.min(Math.round((this.totalSalesAmount / targetSales) * 100), 100)
      },
      {
        title: 'Total Orders',
        value: this.totalOrders.toString(),
        icon: 'cart-outline',
        percent: Math.min(Math.round((this.totalOrders / targetOrders) * 100), 100)
      },
      {
        title: 'Average Order Value',
        value: `R${this.averageOrderValue.toFixed(2)}`,
        icon: 'trending-up-outline',
        percent: Math.min(Math.round((this.averageOrderValue / targetAvgOrderValue) * 100), 100)
      },
      {
        title: 'Top Product',
        value: this.topProduct,
        icon: 'star-outline',
        percent: 90 // Placeholder, replace with actual calculation if available
      }
    ];
  }
  goToPage(page: number) {
    this.currentPage = page;
    this.updateDisplayedSales();
  }
  getProgressCircle(percent: number): string {
    const circumference = 2 * Math.PI * 15.9155;
    const progress = (percent / 100) * circumference;
    return `${progress} ${circumference}`;
  }
}