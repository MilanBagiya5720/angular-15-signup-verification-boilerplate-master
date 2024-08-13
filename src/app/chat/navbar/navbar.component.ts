import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '@app/_utils/_services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent implements OnInit {
  user: any;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getUserDetails();
  }

  getUserDetails(): void {
    this.user = this.apiService.getUserDetails();
  }
  logout(): void {
    this.apiService.logout();
  }

  isLoggedIn(): boolean {
    return this.apiService.isLoggedIn();
  }
}
