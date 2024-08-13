import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SocketService } from '../services/socket.service';

import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ApiService } from '@app/services/api.service';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent {
  name: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private socketService: SocketService,
    private apiService: ApiService
  ) { }

  onSubmit(): void {
    this.http.post<any>(`${environment.localUrl}/api/users/login`, {
      name: this.name,
      password: this.password,
    })
      .subscribe(
        (response) => {
          if (response.auth && response.token) {
            this.socketService.registerUserId(response.user.id);
            localStorage.setItem('token', response.token);
            this.apiService.setUserDetails(response.user);
            this.router.navigate(['/chat']);
          } else {
            this.errorMessage = 'Invalid name or password';
          }
        },
        (error) => {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      );
  }
}
