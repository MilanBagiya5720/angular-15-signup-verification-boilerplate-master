import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@app/_utils/_models/model';
import { ApiService } from '@app/_utils/_services/api.service';
import { SocketService } from '@app/_utils/_services/socket.service';
import { UserService } from '@app/_utils/_services/user.service';
import { Subscription } from 'rxjs';
import { UserListComponent } from '../user-list/user-list.component';
import { ChatService } from '@app/_utils/_services';


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
  usersList: User[] = [];
  receiverId: number;

  selectedUser: User;

  constructor(
    private socketService: SocketService,
    public apiService: ApiService,
    private userService: UserService,
    public dialog: MatDialog,
    private chatService: ChatService
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
    this.receiveRequest();
    this.updateUserList();
    this.messageRequestResponse();
    this.listenClearChat();
    this.getUnreadMessagesCount();
  }

  private registerUser(): void {
    this.socketService.registerUserId(this.userId);
  }

  private getUnreadMessagesCount(): void {
    this.subs.add(this.chatService.getUnreadMessagesCount(this.userId).subscribe((data) => {
      this.totalUnreadMessageCount = data.unreadCount;
    }))
  }

  private fetchUnreadMessageCount(): void {
    this.subs.add(this.socketService.getUpdateUnreadMessageCount().subscribe((data) => {
      if (data.userId === this.userId) {
        this.totalUnreadMessageCount = data.unreadMessageCount;
      }
    }))
  }

  private fetchUsersList(): void {
    this.subs.add(this.userService.fetchUsersByFilter(this.userId, this.activeTab).subscribe((user: any) => {
      this.usersList = user.users;
    }))
  }

  public changeTab(tab: Tabs): void {
    this.activeTab = tab;
    this.usersList = [];
    this.fetchUsersList();
  }

  private checkUserStatus(): void {
    this.subs.add(this.socketService.updateUserStatus().subscribe((data) => {
      this.updateUserStatus(data)
    }))
  }

  private updateUserList(): void {
    this.subs.add(this.socketService.updateUserList().subscribe((data) => {
      if (this.userId === data.receiverId && this.activeTab === data.status) {
        this.usersList = data.users;
      }
    }))
  }

  private updateUserStatus(data: any): void {
    const user = this.usersList.find((u) => u.id === data.userId);
    if (user) {
      user.is_online = data.is_online;
    }
  }

  private receiveRequest(): void {
    this.subs.add(this.socketService.updateUserList().subscribe((data) => {
      if (this.userId === data.receiverId && this.activeTab === data.status) {
        this.usersList = data.users;
      }
    }))
  }

  private messageRequestResponse(): void {
    this.subs.add(
      this.socketService.messageRequestResponse().subscribe(() => {
        this.activeTab = Tabs.Accepted;
        this.fetchUsersList();
      })
    )
  }

  private listenClearChat(): void {
    this.socketService.listenClearChat().subscribe(() => {
      this.fetchUsersList();
    });
  }


  public openDialog(): void {
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
