import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController ,AlertController} from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PickerOptions } from '@ionic/core';


interface Promotion {
  promotion_id?: number;
  name: string;
  description: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  product_id: number;
}

interface Product {
  product_id: number;
  name: string;
}

@Component({
  selector: 'app-promotion-management',
  templateUrl: './promotion-management.component.html',
  styleUrls: ['./promotion-management.component.scss']
})
export class PromotionManagementComponent implements OnInit {
  promotions: Promotion[] = [];
  products: Product[] = [];
  promotionForm: FormGroup;
  editMode = false;
  currentPromotionId?: number;

  dateForm: FormGroup | undefined;
  minDate: string | undefined;
  maxDate: string | undefined;
  // startDate: string;
  startDate: string | undefined; // Optional or uninitialized at first


  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.promotionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      discount_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      product_id: ['', Validators.required]
    });
    this.initializeForm();
    this.setMinMaxDates();
  }

  ngOnInit() {
    this.loadProducts();
    this.loadPromotions();
  }

 // Initialize the form
 initializeForm() {
  this.dateForm = this.fb.group({
    start_date: ['', Validators.required],
    end_date: ['', Validators.required]
  });
}

// Set min and max dates dynamically
setMinMaxDates() {
  const today = new Date();
  this.minDate = today.toISOString().split('T')[0];  // Minimum date is today
  this.maxDate = new Date(today.getFullYear() + 1, 11, 31).toISOString(); // Maximum date is end of next year
}

// Handle logic when the start date changes
onStartDateChange(event: any) {
  this.startDate = event.detail.value;
}

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost/user_api/products.php')
      .subscribe(
        data => {
          this.products = data;
        },
        (error: HttpErrorResponse) => {
          this.showToast('Failed to load products.', 'danger');
        }
      );
  }

  loadPromotions() {
    this.http.get<Promotion[]>('http://localhost/user_api/promotions.php')
      .subscribe(
        data => {
          this.promotions = data;
        },
        (error: HttpErrorResponse) => {
          this.showToast('Failed to load promotions.', 'danger');
        }
      );
  }

  onSubmit() {
    if (this.promotionForm.valid) {
      const promotion = this.promotionForm.value;

      if (this.editMode && this.currentPromotionId) {
        this.http.put(`http://localhost/user_api/promotions.php?id=${this.currentPromotionId}`, promotion)
          .subscribe(
            () => {
              this.loadPromotions();
              this.resetForm();
              this.showToast('Promotion updated successfully.', 'success');
            },
            (error: HttpErrorResponse) => {
              this.showToast('Failed to update promotion.', 'danger');
            }
          );
      } else {
        this.http.post('http://localhost/user_api/promotions.php', promotion)
          .subscribe(
            () => {
              this.loadPromotions();
              this.resetForm();
              this.showToast('Promotion added successfully.', 'success');
            },
            (error: HttpErrorResponse) => {
              this.showToast('Failed to add promotion.', 'danger');
            }
          );
      }
    }
  }

  editPromotion(promotion: Promotion) {
    this.editMode = true;
    this.currentPromotionId = promotion.promotion_id;
    this.promotionForm.patchValue(promotion);
  }

  deletePromotion(id?: number) {
    if (id && confirm('Are you sure you want to delete this promotion?')) {
      this.http.delete(`http://localhost/api/promotions.php?id=${id}`)
        .subscribe(
          () => {
            this.loadPromotions();
            this.showToast('Promotion deleted successfully.', 'success');
          },
          (error: HttpErrorResponse) => {
            this.showToast('Failed to delete promotion.', 'danger');
          }
        );
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  confirmDeletePromotion(promotionId?: number) {
    // Implement a confirmation dialog before deleting
    // For example, using Ionic AlertController
    this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this promotion?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deletePromotion(promotionId);
          }
        }
      ]
    }).then(alert => alert.present());
  }
  resetForm() {
    this.editMode = false;
    this.currentPromotionId = undefined;
    this.promotionForm.reset();
    this.showToast('Form reset.', 'secondary');
  }
}
