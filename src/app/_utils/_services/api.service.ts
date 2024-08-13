import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';
import { User } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = `${environment.localUrl}/api/users`;

  constructor(
    private http: HttpClient,
    private socketSvc: SocketService,
    private router: Router
  ) { }

  userList(loggedInUserId: number, filters?: { searchQuery?: string; limit?: number; offset?: number }): Observable<any[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.searchQuery) {
        params = params.set('searchQuery', filters.searchQuery);
      }
      if (filters.limit) {
        params = params.set('limit', filters.limit.toString());
      }
      if (filters.offset) {
        params = params.set('offset', filters.offset.toString());
      }
    }

    return this.http.get<any[]>(`${this.apiUrl}/${loggedInUserId}`, { params });
  }

  setUserDetails(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.setUserId(user.id);
  }

  getUserDetails(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  setUserId(userId: number): void {
    localStorage.setItem('userId', userId.toString());
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? +userId : null;
  }

  setReceiverId(receiverId: number): void {
    localStorage.setItem('receiverId', receiverId.toString());
  }

  getReceiverId(): number | null {
    const receiverId = localStorage.getItem('receiverId');
    return receiverId ? +receiverId : null;
  }

  setReceiver(receiver: any): void {
    localStorage.setItem('receiverUser', JSON.stringify(receiver));
  }

  getReceiver(): any {
    const receiver = localStorage.getItem('receiverUser');
    return receiver ? JSON.parse(receiver) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.clear();
    this.socketSvc.disconnect();
    this.router.navigate(['/login']);
  }

  getUserProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile/${userId}`);
  }

  public getUserImage(user: User): string {
    return user.images
      ? `https://d3s43g258b91qc.cloudfront.net/` + user.images : 'assets/self.jpg';
  }
}
