import { Component, OnInit, Injectable, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '@app/_utils/_services/api.service';
import { SocketService } from '@app/_utils/_services/socket.service';
import { UserService } from '@app/_utils/_services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less']
})
export class UserListComponent implements OnInit {
  userId: number;
  users: any[] = [];

  constructor(private userService: UserService,
    public apiService: ApiService,
    private socketService: SocketService,
    public dialogRef: MatDialogRef<UserListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

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
    alert('Message sent successfully');
    this.dialogRef.close();
  }
}
