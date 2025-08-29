import { Component, OnInit } from '@angular/core';
import { SalesService } from '../sales.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-history',
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.css']
})
export class SalesHistoryComponent implements OnInit {
  sales: any[] = [];
  userRole: string = '';
  constructor(private salesService: SalesService, private router: Router) {}

  ngOnInit() {
    this.setUserRole();
    this.loadSalesHistory();
    
  }
setUserRole() {
    // You can adapt this based on your authentication system
    const storedRole = localStorage.getItem('userRoles'); 
    this.userRole = storedRole ? storedRole : 'cashier'; 
    console.log(storedRole)// default to cashier if not set
  }
  loadSalesHistory() {
    this.salesService.getSalesHistory().subscribe(data => {
      this.sales = data;
      // Sort by latest first
      this.sales.sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
    });
  }

  viewBill(saleId: number) {
    this.salesService.getSaleDetails(saleId).subscribe(sale => {
      // Pass bill data as state (the same way checkout does)
      this.router.navigate(['/bill'], {
        state: {
          items: sale.items,
          totalAmount: sale.total_price,
          saleId: sale.id,
          date: new Date(sale.sale_date).toLocaleString(),
          paymentMethod: sale.payment_method,
          customerInfo: sale.customer_info
        }
      });
    });
  }
}