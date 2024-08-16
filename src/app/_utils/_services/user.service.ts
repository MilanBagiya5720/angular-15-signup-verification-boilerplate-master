import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getAllUsers(userId: number, searchQuery?: string, limit = 10, offset = 0): Observable<any[]> {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.set('searchQuery', searchQuery);
    }
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`, { params });
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
