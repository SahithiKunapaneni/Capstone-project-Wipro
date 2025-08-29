import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as bootstrap from 'bootstrap'; 
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  // ✅ One object for both Add and Edit
  currentUser: any = { username: '', email: '', password: '', role: 'user' };

  // ✅ Mode flag
  isEditMode: boolean = false;

  // ✅ For showing backend validation/errors
  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  selectedStatus: string = 'all';  
  selectedRole: string = 'all'; 
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.http.get<User[]>('http://127.0.0.1:5051/api/users')
      .subscribe(data => {
        this.users = [...data];
      });
  }

  get filteredUsers(): User[] {
    return this.users.filter(user => {
      const statusMatch =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && user.is_active) ||
        (this.selectedStatus === 'inactive' && !user.is_active);

      const roleMatch =
        this.selectedRole === 'all' || user.role === this.selectedRole;

      const searchMatch =
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase());

      return statusMatch && roleMatch && searchMatch;
    });
  }

  /** ============ Modal Actions ============  */

  openAddUser() {
    this.isEditMode = false;
    this.currentUser = { username: '', email: '', password: '', role: 'user' }; // reset
    this.clearAlert();
    this.openModal();
  }

  openEditUser(user: any) {
    this.isEditMode = true;
    this.currentUser = { ...user, password: '' };
    this.clearAlert();
    this.openModal();
  }

  private openModal() {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private closeModal() {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  private showAlert(message: string, type: 'success' | 'danger' = 'danger') {
    this.alertMessage = message;
    this.alertType = type;

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      this.alertMessage = null;
    }, 5000);
  }

  private clearAlert() {
    this.alertMessage = null;
  }

  /** ============ CRUD ============  */

  registerUser() {
    this.http.post('http://127.0.0.1:5051/api/register', this.currentUser).subscribe({
      next: () => {
        this.getUsers();
        this.closeModal();
        this.showAlert('User added successfully ✅', 'success');
      },
      error: (err) => {
        let errorMsg = 'Failed to add user.';
        if (err.error && err.error.message) {
          errorMsg = err.error.message;  // backend sends { "message": "...validation..." }
        }
        this.showAlert(errorMsg, 'danger');
      }
    });
  }

  updateUser() {
    const payload: any = {
      username: this.currentUser.username,
      email: this.currentUser.email,
      role: this.currentUser.role
    };

    if (this.currentUser.password && this.currentUser.password.trim() !== '') {
      payload.password = this.currentUser.password;
    }

    this.http.put(`http://127.0.0.1:5051/api/users/${this.currentUser.id}`, payload).subscribe({
      next: () => {
        this.getUsers();
        this.closeModal();
        this.showAlert('User updated successfully ✅', 'success');
      },
      error: (err) => {
        let errorMsg = 'Failed to update user.';
        if (err.error && err.error.message) {
          errorMsg = err.error.message;
        }
        this.showAlert(errorMsg, 'danger');
      }
    });
  }

  deleteUser(id: number) {
    this.http.delete(`http://127.0.0.1:5051/api/users/${id}`).subscribe({
      next: () => {
        this.getUsers();
        this.showAlert('User deleted successfully 🗑', 'success');
      },
      error: () => this.showAlert('Failed to delete user.', 'danger')
    });
  }

  blockUser(id: number) {
    this.http.put(`http://127.0.0.1:5051/api/users/${id}/block`, {}).subscribe({
      next: () => {
        this.getUsers();
        this.showAlert('User blocked 🚫', 'success');
      },
      error: () => this.showAlert('Failed to block user.', 'danger')
    });
  }

  unblockUser(id: number) {
    this.http.put(`http://127.0.0.1:5051/api/users/${id}/unblock`, {}).subscribe({
      next: () => {
        this.getUsers();
        this.showAlert('User unblocked ✅', 'success');
      },
      error: () => this.showAlert('Failed to unblock user.', 'danger')
    });
  }
}