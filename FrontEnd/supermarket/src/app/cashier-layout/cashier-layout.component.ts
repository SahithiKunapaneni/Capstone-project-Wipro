import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cashier-layout',
  templateUrl: './cashier-layout.component.html',
  styleUrls: ['./cashier-layout.component.css']
})
export class CashierLayoutComponent implements OnInit{
username: string = '';
constructor(private router: Router) {}
ngOnInit(): void {
    // Replace with actual logic to retrieve username, e.g. from localStorage or a service
    this.username = localStorage.getItem('usernames') || 'Cashier';
  }
  logout() {
    // Clear session or token then redirect to login page.
    this.router.navigate(['/login']);
  }
}
