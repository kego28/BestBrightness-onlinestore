// // File: src/app/pages/sales-chart/sales-chart.component.ts
import { Component, OnInit } from '@angular/core';

import { Chart } from 'chart.js/auto';
import { ChartDataService } from '../services/chart-data.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss'],
})
export class SalesChartComponent implements OnInit {
//   chart: any;
//   period: string = 'month'; // default period

//   constructor(private ChartDataService: ChartDataService,private modalController: ModalController) {}

//   ngOnInit(): void {
//     this.loadSalesData();
//   }

//   loadSalesData() {

//     this.ChartDataService.getSalesData(this.period).subscribe(
//       (response) => {
//         if (response.status === 'success') {
//           this.createChart(response.data);
//         } else {
//           console.error(response.message);
//         }
//       },
//       (error) => {
//         console.error('Error fetching sales data', error);
//       }
//     );
//   }

//   createChart(data: any) {
//     const labels = data.map((item: any) => item.period);
//     const totals = data.map((item: any) => item.total);

//     // Destroy existing chart if exists
//     if (this.chart) this.chart.destroy();

//     // Initialize a new chart
//     this.chart = new Chart('salesChart', {
//       type: 'bar', // You can change this to 'line', 'doughnut', etc.
//       data: {
//         labels: labels,
//         datasets: [
//           {
//             label: `Sales (${this.period})`,
//             data: totals,
//             backgroundColor: 'rgba(54, 162, 235, 0.6)',
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: {
//             display: true,
//           },
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//           },
//         },
//       },
//     });
//   }

//   // Method to update period and reload data
//   setPeriod(newPeriod: string) {
//     this.period = newPeriod;
//     this.loadSalesData();
//   }

//   closeModal() {
//     this.modalController.dismiss();
//   }
// }

  private chart: any;

  constructor(private modalController: ModalController) {}

  ionViewDidEnter() {
    this.initializeChart('day');
  }

  // Method to initialize chart
  initializeChart(period: string) {
    // Logic to set the chart based on period (day, week, or month)
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLabels(period),
        datasets: [
          {
            label: 'Sales',
            data: this.getSalesData(period),
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Sales Amount',
            },
          },
        },
      },
    });
  }

  // Set period for chart (day, week, month)
  setPeriod(period: string) {
    this.initializeChart(period);
  }

  // Method to close modal
  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit(): void {}
  // Sample methods for fetching labels and data
  getLabels(period: string): string[] {
    switch (period) {
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'year':
          return ['month 1', 'month 2', 'month 3', 'month 4','month 5', 'month 6', 'month 7', 'month 8','month 9', 'month 10', 'month 11', 'month 12'];
      default:
        return ['00:00', '06:00', '12:00', '18:00', '24:00'];
    }
  }

  getSalesData(period: string): number[] {
    switch (period) {
      case 'week':
        return [150, 170, 160, 170, 200, 180, 105];
      case 'month':
        return [50, 55, 45, 35];
      case 'year':
          return [4100, 4300, 3900, 4250];
      default:
        return [6, 9, 15, 13, 14];
    }
  }
}
