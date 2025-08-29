import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit{
  username: string = '';
 // replace with real user from auth service
constructor(private router: Router) {}
ngOnInit(): void {
    // Replace with actual logic to retrieve username, e.g. from localStorage or a service
    this.username = localStorage.getItem('usernames') || 'Admin';
  }

  logout() {
    // Your logout logic, e.g., clear tokens and redirect
    // Example:
    // localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
