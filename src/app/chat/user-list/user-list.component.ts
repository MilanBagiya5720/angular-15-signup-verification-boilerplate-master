import { Component, OnInit } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less']
})
export class UserListComponent implements OnInit {
  userId: number;
  users: any[] = [];

  constructor(private userService: UserService,
    private apiService: ApiService,
    private socketService: SocketService) {

    this.userId = this.apiService.getUserId();
  }

  ngOnInit(): void {
    this.getUsersList();
  }

  private getUsersList(): void {
    this.userService.getAllUsers(this.userId).subscribe({
      next: (data: any) => {
        this.users = data.users;
      },
      error: (error: any) => {
        console.error('Failed to load users', error);
      },
    });
  }

  sendMessageReq(receiver: number): void {
    this.socketService.sendMessageRequest(this.userId, receiver);
    this.getUsersList();
  }
}
