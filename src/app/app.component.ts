import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';


@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit {
  user: any;

  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.getUserDetails();
  }


  getUserDetails(): void {
    this.user = this.apiService.getUserDetails();
  }
}
