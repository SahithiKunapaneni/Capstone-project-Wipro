import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from './models/sale.model';
import { CheckoutItem } from './models/checkout-item.model';  
import { Product } from './models/product.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = 'http://127.0.0.1:5054/api/sales';

  constructor(private http: HttpClient) {}

  // ✅ Fetch products for checkout
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // ✅ Checkout
  // ✅ Checkout
checkout(payload: { 
  items: CheckoutItem[], 
  payment_method: string, 
  customer_info: string 
}): Observable<{ message: string; saleId: number }> {
  return this.http.post<{ message: string; saleId: number }>(
    `${this.apiUrl}/checkout`, 
    payload  // send full object, not just { items }
  );
}

  // ✅ Sales history
  getSalesHistory(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/history`);
  }

  // ✅ Single sale details
  getSaleDetails(saleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/history/${saleId}`);
  }
}