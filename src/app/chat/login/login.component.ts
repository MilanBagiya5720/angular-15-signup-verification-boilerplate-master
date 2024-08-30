import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SocketService } from '../../_utils/_services/socket.service';

import { Router } from '@angular/router';
import { ApiService } from '@app/_utils/_services/api.service';
import { environment } from '@environments/environment';

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
