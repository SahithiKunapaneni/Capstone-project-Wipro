import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  userRole: string = '';
  showMessage: string = '';   // ✅ message string

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    const credentials = {
      username: this.username,
      password: this.password
    };

    this.http.post('http://localhost:5051/api/login', credentials)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.showMessage = response.message || 'Login successful';

          if (response.role) {
            localStorage.setItem('userRoles', response.role);
            localStorage.setItem('usernames', this.username);
            console.log('usernames')
            if (response.role === 'admin') {
              this.router.navigate(['/dashboard']);
            } else if (response.role === 'cashier') {
              this.router.navigate(['/checkout']);
            }
          }
        },
        error: (error) => {
          console.error(error);
          this.showMessage = error.error?.message || 'An error occurred while logging in';
        }
      });
  }
}