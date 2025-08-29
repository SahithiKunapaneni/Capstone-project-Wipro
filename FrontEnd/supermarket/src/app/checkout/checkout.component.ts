import { Router } from '@angular/router';
import { SalesService } from '../sales.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

interface Product {
id: number;
name: string;
price: number;
stock: number;
quantity: number;
category: string;
}

@Component({
selector: 'app-checkout',
templateUrl: './checkout.component.html',
styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
products: Product[] = [];
totalAmount: number = 0;
paymentMethod: string = 'Cash';
customerInfo: string = '';
userRole: string = 'admin';
searchTerm: string = '';
selectedCategory: string = '';
categories: string[] = [];


constructor(private salesService: SalesService, private userService: UserService,private router: Router) {}

ngOnInit() {
this.loadProducts();
this.loadUserRole();
}
message: string = '';
messageType: 'success' | 'error' | 'info' | '' = '';

showMessage(message: string, type: 'success' | 'error' | 'info' = 'info') {
  this.message = message;
  this.messageType = type;

  // Auto-clear after 3 seconds
  setTimeout(() => {
    this.message = '';
    this.messageType = '';
  }, 3000);
}
loadProducts() {
    this.salesService.getProducts().subscribe(data => {
      this.products = data.map(product => ({
        ...product,
        quantity: 0
      }));

      // Extract unique categories for the filter dropdown
      this.categories = Array.from(new Set(this.products.map(p => p.category)));
    });
  }

  get filteredProducts(): Product[] {
    return this.products
      .filter(product =>
        product.stock > 0 &&
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        (!this.selectedCategory || product.category === this.selectedCategory)
      );
  }
loadUserRole() {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userRole = user.role;
    }
  }

updateTotal() {
this.totalAmount = this.products
.reduce((sum, product) => sum + product.price * product.quantity, 0);
}

clearCart() {
this.products.forEach(product => product.quantity = 0);
this.updateTotal();
}

checkout() {
  if (!this.customerInfo) {
    this.showMessage('Please enter the customer name before checkout.', 'error');
    return;
  }
  if (!this.paymentMethod) {
    this.showMessage('Please select a payment method.', 'error');
    return;
  }

  const items = this.products
    .filter(product => product.quantity > 0)
    .map(product => ({
      product_id: product.id,
      product_name: product.name,
      quantity: product.quantity,
      price: product.price,
      total_price: product.price * product.quantity
    }));

  if (items.length === 0) {
    this.showMessage('No items in checkout. Please add at least one product.', 'error');
    return;
  }

  this.salesService.checkout({
    items,
    payment_method: this.paymentMethod,   // ✅ match backend naming convention
    customer_info: this.customerInfo
  }).subscribe({
    next: (response: any) => {
      this.showMessage('Checkout successful! Redirecting to bill details.', 'success');

      const saleId = response.saleId;
      const date = new Date().toLocaleString();

      this.router.navigate(['/bill'], {
        state: {
          items,
          totalAmount: this.totalAmount,
          saleId,
          date,
          paymentMethod: this.paymentMethod,
          customerInfo: this.customerInfo
        }
      });
    },
    error: (error: any) => {
      if (error.error && error.error.message) {
        this.showMessage(error.error.message, 'error');  // ✅ Backend validation messages
      } else if (error.error && error.error.error) {
        this.showMessage(error.error.error, 'error');
      } else {
        this.showMessage('An unexpected error occurred during checkout.', 'error');
      }
    }
  });

  console.log({
    items,
    payment_method: this.paymentMethod,
    customer_info: this.customerInfo
  });
}

}
