// order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { environment } from '../environments/environment';

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
}

interface OrderData {
  orderNumber: string;
  user_id: string;
  total_amount: number;
  order_type: string;
  status: string;
  items: OrderItem[];
  created_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceOrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

   generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async checkProductQuantities(items: OrderItem[]): Promise<{ isValid: boolean; invalidItems: any[] }> {
    const invalidItems = [];
    
    for (const item of items) {
      const response = await this.http.get<{ quantity: number }>(
        `${this.apiUrl}/products.php?check_quantity=1&product_id=${item.product_id}`
      ).toPromise();
      
      if (response && response.quantity < item.quantity) {
        invalidItems.push({
          name: item.name,
          availableQuantity: response.quantity
        });
      }
    }
    
    return {
      isValid: invalidItems.length === 0,
      invalidItems
    };
  }

  async updateStock(item: OrderItem): Promise<void> {
    const currentStock = await this.http.get<{ quantity: number }>(
      `${this.apiUrl}/products.php?check_quantity=1&product_id=${item.product_id}`
    ).toPromise();

    if (currentStock) {
      const newQuantity = currentStock.quantity - item.quantity;
      await this.http.put(
        `${this.apiUrl}/update_stock.php`,
        { product_id: item.product_id, quantity: newQuantity }
      ).toPromise();
    }
  }

  generateOrderPDF(orderData: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    deliveryAddress?: any;
    items: OrderItem[];
    subtotal: number;
    discountedSubtotal: number;
    tax: number;
    total: number;
  }): Blob {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Order Confirmation", pageWidth / 2, 20, { align: "center" });

    // Company Info
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Your Company Name", pageWidth / 2, 35, { align: "center" });
    pdf.text("123 Business Street", pageWidth / 2, 42, { align: "center" });
    pdf.text("Business City, BC 12345", pageWidth / 2, 49, { align: "center" });
    
    // Order Details
    pdf.setFontSize(10);
    pdf.text(`Order #: ${orderData.orderNumber}`, 20, 65);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 65);
    
    // Customer Info
    pdf.text("Bill To:", 20, 80);
    pdf.text(orderData.customerName, 20, 87);
    pdf.text(orderData.customerEmail, 20, 94);

    if (orderData.deliveryAddress) {
      pdf.text("Ship To:", pageWidth - 90, 80);
      pdf.text(orderData.deliveryAddress.address_line1, pageWidth - 90, 87);
      if (orderData.deliveryAddress.address_line2) {
        pdf.text(orderData.deliveryAddress.address_line2, pageWidth - 90, 94);
      }
      pdf.text(`${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.province}`, pageWidth - 90, 101);
      pdf.text(orderData.deliveryAddress.postal_code, pageWidth - 90, 108);
    }

    // Items Table
    const tableColumns = ["Item", "Qty", "Price", "Discount", "Total"];
    const tableRows = orderData.items.map(item => [
      item.name,
      item.quantity.toString(),
      `R${item.price.toFixed(2)}`,
      item.discountedPrice ? `R${(item.price - item.discountedPrice).toFixed(2)}` : '-',
      `R${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}`
    ]);

    autoTable(pdf, {
      head: [tableColumns],
      body: tableRows,
      startY: 120,
      theme: 'striped',
      headStyles: { 
        fillColor: [51, 51, 51],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      }
    });

    const finalY = (pdf as any).lastAutoTable.finalY + 10;

    // Totals
    pdf.text(`Subtotal:`, pageWidth - 90, finalY + 10);
    pdf.text(`R${orderData.subtotal.toFixed(2)}`, pageWidth - 30, finalY + 10, { align: 'right' });
    
    if (orderData.discountedSubtotal !== orderData.subtotal) {
      pdf.text(`Discounted Subtotal:`, pageWidth - 90, finalY + 17);
      pdf.text(`R${orderData.discountedSubtotal.toFixed(2)}`, pageWidth - 30, finalY + 17, { align: 'right' });
    }
    
    pdf.text(`Tax (15%):`, pageWidth - 90, finalY + 24);
    pdf.text(`R${orderData.tax.toFixed(2)}`, pageWidth - 30, finalY + 24, { align: 'right' });
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total:`, pageWidth - 90, finalY + 31);
    pdf.text(`R${orderData.total.toFixed(2)}`, pageWidth - 30, finalY + 31, { align: 'right' });

    // Footer
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const footerText = "Thank you for your business!";
    pdf.text(footerText, pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

    return pdf.output('blob');
  }

  placeOrder(orderData: OrderData): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/virtualOrder.php`,
      orderData
    );
  }
}











  // async PlaceOrder(): Promise<void> {
  //   try {
  //     // Validate cart
  //     if (this.cartItems.length === 0) {
  //       await this.showAlert('Empty Cart', 'Your cart is empty. Add some items before placing an order.');
  //       return;
  //     }

  //     if (!this.userEmail) {
  //       await this.showToast('User email not found. Please log in again.');
  //       return;
  //     }

  //     // Check quantities
  //     const { isValid, invalidItems } = await this.placeorder.checkProductQuantities(this.cartItems);
  //     if (!isValid) {
  //       let message = 'The following items have insufficient quantity:\n';
  //       invalidItems.forEach(item => {
  //         message += `${item.name}: ${item.availableQuantity} available\n`;
  //       });
  //       await this.showAlert('Insufficient Quantity', message);
  //       return;
  //     }

  //     // Generate order data
  //     const orderNumber = this.placeorder.generateOrderNumber();
  //     const orderData = this.prepareOrderData(orderNumber);

  //     // Generate PDF for email
  //     const pdfBlob = this.placeorder.generateOrderPDF({
  //       orderNumber,
  //       customerName: `${sessionStorage.getItem('userName')} ${sessionStorage.getItem('userSurname')}`,
  //       customerEmail: this.userEmail,
  //       deliveryAddress: this.selectedAddress,
  //       items: this.cartItems,
  //       subtotal: this.subtotal,
  //       discountedSubtotal: this.discountedSubtotal,
  //       tax: this.tax,
  //       total: this.total
  //     });

  //     // Show confirmation dialog
  //     const confirmed = await this.showOrderConfirmation(orderData);
  //     if (!confirmed) return;

  //     // Place order
  //     const response = await this.placeorder.placeOrder(orderData).toPromise();

  //     if (response?.success) {
  //       // Update stock
  //       for (const item of this.cartItems) {
  //         await this.placeorder.updateStock(item);
  //       }

  //       // Clear cart
  //       await this.cartService.clearCart().toPromise();
        
  //       // Show receipt
  //       this.receiptData = {
  //         orderNumber,
  //         items: this.cartItems,
  //         subtotal: this.subtotal,
  //         tax: this.tax,
  //         total: this.total
  //       };
  //       this.receiptVisible = true;

  //       await this.showAlert('Order Placed', `Your order for R${this.total.toFixed(2)} has been placed successfully!`);
        
  //       // Reset component state
  //       this.cartItems = [];
  //       this.calculateTotals();
  //     } else {
  //       throw new Error('Server response indicates failure');
  //     }
  //   } catch (error) {
  //     console.error('Error in order placement process:', error);
  //     await this.showToast('An error occurred while placing your order. Please try again.');
  //   }
  // }

  // private prepareOrderData(orderNumber: string): OrderData {
  //   return {
  //     orderNumber,
  //     // user_id: this.userId,
  //     user_id: this.userId || 'defaultUserId',
  //     total_amount: this.total,
  //     order_type: this.deliveryMethod,
  //     status: 'pending',
  //     items: this.cartItems.map(item => ({
  //       product_id: item.product_id,
  //       name: item.name,
  //       quantity: item.quantity,
  //       price: item.price,
  //       discountedPrice: item.discountedPrice
  //     })),
  //     created_at: new Date()
  //   };
  // }

  // private async showAlert(header: string, message: string): Promise<void> {
  //   const alert = await this.alertController.create({
  //     header,
  //     message,
  //     buttons: ['OK']
  //   });
  //   await alert.present();
  // }

 

  // private async showOrderConfirmation(orderData: OrderData): Promise<boolean> {
  //   return new Promise(async (resolve) => {
  //     const orderDetails = this.cartItems.map(item => 
  //       `Product ID: ${item.product_id}\n` +
  //       `Name: ${item.name}\n` +
  //       `Quantity: ${item.quantity}\n` +
  //       `Price: R${item.price.toFixed(2)}\n` +
  //       `Discounted Price: R${item.discountedPrice ? item.discountedPrice.toFixed(2) : 'N/A'}\n`
  //     ).join('\n');

  //     const alert = await this.alertController.create({
  //       header: 'Order Confirmation',
  //       message: `You are about to place the following order:\n\n${orderDetails}`,
  //       buttons: [
  //         {
  //           text: 'Cancel',
  //           role: 'cancel',
  //           handler: () => resolve(false)
  //         },
  //         {
  //           text: 'Confirm',
  //           handler: () => resolve(true)
  //         }
  //       ]
  //     });

  //     await alert.present();
  //   });
  // }