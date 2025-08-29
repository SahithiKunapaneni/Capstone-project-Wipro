import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserKey: string = 'currentUser';
  private apiUrl = 'http://127.0.0.1:5051/api/users';
  private registerUrl = 'http://127.0.0.1:5051/api/register';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  registerUser(user: User): Observable<any> {
    return this.http.post(this.registerUrl, user);
  }

  updateUser(userId: number, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, user);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  blockUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/block`, {});
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/unblock`, {});
  }
  setCurrentUser(user: User): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  // Retrieve user info from localStorage
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.currentUserKey);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  }
  clearCurrentUser(): void {
    localStorage.removeItem(this.currentUserKey);  // use this.currentUserKey
  }
}