import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '@app/services/api.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';
import { Subscription, Subject } from 'rxjs';
import { UserListComponent } from '../user-list/user-list.component';


export enum Tabs {
  Pending = 'pending',
  Accepted = 'accepted',
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.less']
})
export class TabsComponent implements OnInit, OnDestroy {
  activeTab: Tabs = Tabs.Accepted;
  totalUnreadMessageCount: number | null = 0;
  userId: number;
  subs: Subscription;
  userTabs = Tabs;
  usersList: any[] = [];

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private userService: UserService,
    public dialog: MatDialog
  ) {
    this.userId = this.apiService.getUserId();
    this.subs = new Subscription();
  }

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.registerUser();


    this.fetchUnreadMessageCount();
    this.fetchUsersList();
    this.checkUserStatus();
  }

  registerUser(): void {
    this.socketService.registerUserId(this.userId);
  }

  fetchUnreadMessageCount(): void {
    this.subs.add(this.socketService.getUpdateUnreadMessageCount().subscribe((data) => {
      this.totalUnreadMessageCount = data;
    }))
  }

  fetchUsersList(): void {
    this.subs.add(this.userService.fetchUsersByFilter(this.userId, this.activeTab).subscribe((user: any) => {
      this.usersList = user.users;
    }))
  }

  changeTab(tab: Tabs): void {
    this.activeTab = tab;
    this.fetchUsersList();
  }

  checkUserStatus(): void {
    this.subs.add(this.socketService.updateUserStatus().subscribe((data) => {
      this.updateUserStatus(data)
    }))
  }

  private updateUserStatus(data: any): void {
    const user = this.usersList.find((u) => u.id === data.userId);
    if (user) {
      user.is_online = data.is_online;
    }
  }



  openDialog(): void {
    const dialogRef = this.dialog.open(UserListComponent);

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  ngOnDestroy(): void {
    this.totalUnreadMessageCount = null;
    this.subs.unsubscribe();
    this.socketService.disconnect();
  }
}
