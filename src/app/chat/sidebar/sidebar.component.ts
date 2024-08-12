import { Component, OnInit } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent implements OnInit {
  subscription: Subscription;
  users: any[] = [];
  searchInput: string = '';
  loggedInUserId: number = 0;

  constructor(private apiService: ApiService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.fetchUserList();
  }

  fetchUserList() {
    this.subscription.add(
      this.apiService.userList(this.loggedInUserId).subscribe((users) => {

      })
    );
  }
}
