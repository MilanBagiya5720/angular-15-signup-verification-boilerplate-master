import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '@app/services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {
  @Input() user: any;

  constructor(private apiService: ApiService) { }

  logout(): void {
    this.apiService.logout();
  }

  isLoggedIn(): boolean {
    return this.apiService.isLoggedIn();
  }
}
