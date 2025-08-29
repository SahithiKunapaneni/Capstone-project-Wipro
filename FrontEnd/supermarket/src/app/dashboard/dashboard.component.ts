import { Component, OnInit } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../models/user.model';
import { SalesService } from '../sales.service';
import { Sale } from '../models/sale.model';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent  implements OnInit {
  products: Product[] = [];
  users: User[] = [];
    sales: Sale[] = []; 
  newUser = { username: '', email: '', password: '', role: '' };
  product: Product = {
    id: 0, 
    name: '',
    price: 0,
    stock: 0,
    description: '',
    category: '',
    minimum_stock: 0
  };

  showProductForm = false;
  successMessage: string = '';   // ✅ added for alerts

  constructor(private productService: ProductService, private userService: UserService ,private router: Router, private salesService: SalesService ) {}

  ngOnInit() {
    this.getProducts();
    this.getUsers();
     this.getSales();
  }
  getSales() {
    this.salesService.getSalesHistory().subscribe((data: Sale[]) => {
      this.sales = data.sort((a, b) => b.id - a.id); // newest first
      this.updateStats();
    });
  }
  getUsers() {
    this.userService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
  }

  calculateUserCount(): number {
    return this.users.length;
  }


  getProducts() {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      this.updateLowStockList(); 
      this.updateStats();
    });
  }
  calculateLowStock(): number {
    return this.products.filter(p => p.stock < p.minimum_stock && p.stock > 0).length;
  }

  calculateTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  stats = [
    { label: 'Total Users', value: 2, icon: 'groups' },
    { label: 'Total Products', value: 10, icon: 'inventory_2' },
    { label: 'Total Sales', value: 5, icon: 'insights' },
    { label: 'Low Stock Items', value: 0, icon: 'warning_amber' }
  ];

  

  lowStock: { name: string; qty: number }[] = []; // empty => "No low stock alerts"
  updateLowStockList() {
  this.lowStock = this.products
    .filter(p => p.stock < p.minimum_stock && p.stock > 0)
    .map(p => ({ name: p.name, qty: p.stock }));
}
calculateTotalSales(): number {
    return this.sales.length;
  }
loadSales() {
    this.salesService.getSalesHistory().subscribe((data: Sale[]) => {
      this.sales = data
        .sort((a, b) => b.id - a.id)   // newest first
        .slice(0, 5);                  // latest 5 only
    });  
}
  calculateTotalRevenue(): number {
    return this.sales.reduce((sum, s) => sum + s.total_price, 0);
  }
updateStats() {
    this.stats = [
      { label: 'Total Users', value: this.users.length, icon: 'groups' },
      { label: 'Total Products', value: this.products.length, icon: 'inventory_2' },
      { label: 'Total Sales', value: this.calculateTotalSales(), icon: 'insights' },
      { label: 'Low Stock Items', value: this.lowStock.length, icon: 'warning_amber' },
      // EXTRA: Revenue card
      { label: 'Total Revenue', value: this.calculateTotalRevenue(), icon: 'attach_money' }
    ];
  }
}