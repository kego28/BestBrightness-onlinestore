import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-sales-report',
  templateUrl: './admin-sales-report.page.html',
  styleUrls: ['./admin-sales-report.page.scss'],
})
export class AdminSalesReportPage implements OnInit {
  salesData: any[] = [];
  displayedSalesData: any[] = []; // Data shown on the current page

  totalSalesAmount: number = 0;
  totalOrders: number = 0;
  averageOrderValue: number = 0;
  topProduct: string = 'Widget X'; // Placeholder, replace with actual logic

  summaryCards: any[] = [];
  pageSize: number = 5; // Items per page
  currentPage: number = 1; // Current page
  totalPages: number = 0; // Total number of pages

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchSalesData();
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

  updateSummaryCards() {
    const targetSales = 10000;
    const targetOrders = 100;
    const targetAvgOrderValue = 200;

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
        percent: Math.min(Math.round((this.averageOrderValue / targetAvgOrderValue) * 600), 100)
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