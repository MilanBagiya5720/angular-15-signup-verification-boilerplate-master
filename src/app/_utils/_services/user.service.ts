import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../_models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.localUrl + '/api/users';

  private userSubject: BehaviorSubject<User>;
  public user$: Observable<User>;

  constructor(private http: HttpClient) {
    this.userSubject = new BehaviorSubject<any>(null);
    this.user$ = this.userSubject.asObservable();
  }

  setUser(user: any) {
    this.userSubject.next(user);
  }

  getUserValue(): any {
    return this.userSubject.value;
  }

  getAllUsers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  fetchUsersByFilter(userId: number, status: string): Observable<any[]> {
    if (status) {
      return this.http.get<any[]>(`${this.apiUrl}/${userId}?status=${status}`);
    } else {
      return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
    }
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
