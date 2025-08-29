import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css']
})
export class BillComponent implements OnInit {
  items: any[] = [];
  totalAmount: number = 0;
  date: string = '';
  saleId: number = 0;
  paymentMethod: string = '';
  customerInfo: string = '';
  userRole: string = '';
  constructor(private router: Router) {
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as {
    items: any[],
    totalAmount: number,
    saleId: number,
    date: string,
    paymentMethod: string,
    customerInfo: string
  };

  if (state) {
    console.log('Received state:', state); // Add this to check the state
    this.items = state.items || [];
    this.totalAmount = state.totalAmount || 0;
    this.saleId = state.saleId || 0;
    this.date = state.date || '';
    this.paymentMethod = state.paymentMethod || 'N/A';
    this.customerInfo = state.customerInfo || 'N/A';
  }
}
  ngOnInit() {
    this.setUserRole();
  }
  setUserRole() {
    // You can adapt this based on your authentication system
    const storedRole = localStorage.getItem('userRoles'); 
    this.userRole = storedRole ? storedRole : 'cashier'; 
    console.log(storedRole)// default to cashier if not set
  }
  goToHistory() {
  this.router.navigate(['/sales-history']); // replace with your actual history route
}
}