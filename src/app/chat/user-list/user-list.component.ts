import { Component, OnInit, Injectable, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '@app/_utils/_models';
import { ApiService } from '@app/_utils/_services/api.service';
import { SocketService } from '@app/_utils/_services/socket.service';
import { UserService } from '@app/_utils/_services/user.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less']
})
export class UserListComponent implements OnInit, OnDestroy {
  private searchSubject: Subject<string> = new Subject<string>();
  userId: number;
  user: any;
  users: any[] = [];
  subs: Subscription = new Subscription();

  page = 0;
  perPage = 10;
  loading = false;

  constructor(private userService: UserService,
    public apiService: ApiService,
    private socketService: SocketService,
    public dialogRef: MatDialogRef<UserListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.userId = this.apiService.getUserId();
    this.user = this.apiService.getUserDetails();

    this.searchDebounce();
  }

  ngOnInit(): void {
    this.getUsersList();
  }

  private getUsersList(): void {
    this.loading = true;
    this.userService.getAllUsers(this.userId, '', this.page, this.perPage).subscribe({
      next: (data: any) => {
        this.users = data.users;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Failed to load users', error);
        this.loading = false;
      },
    });
  }

  private loadMoreUsers(): void {
    if (this.loading) return;
    this.page++;
    this.loading = true;
    this.userService.getAllUsers(this.userId, '', this.page, this.perPage).subscribe({
      next: (data: any) => {
        this.users = [...this.users, ...data.users];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Failed to load more users', error);
        this.loading = false;
      },
    });
  }

  sendMessageReq(receiver: User): void {
    this.socketService.sendMessageRequest(this.userId, receiver.id, receiver.name);
    alert('Message sent successfully');
    this.sendMessage(this.userId, receiver.id, receiver.name);
    this.dialogRef.close();
  }

  sendMessage(userId: number, receiverId: number, receiverName: string): void {
    const message = {
      senderId: userId,
      receiverId: receiverId,
      text: 'Hello, How are you?',
      sender: this.user.name,
      receiver: receiverName,
      isSeen: 0,
      type: 'text',
      videoThumbnail: 'videoThumbnail',
      messageCreatedAt: new Date(),
      status: 'accepted',
      isRequest: true,
    };
    this.socketService.sendMessage(message);
  }

  searchUser(searchQuery: string) {
    this.searchSubject.next(searchQuery);
  }

  performSearch(searchText: string) {
    this.page = 0;
    this.users = [];

    this.subs.add(
      this.userService.getAllUsers(this.userId, searchText, this.page, this.perPage).subscribe({
        next: (data: any) => {
          this.users = data.users;
        },
        error: (error: any) => {
          console.error('Failed to load users', error);
        },
      })
    );
  }

  searchDebounce() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((searchText) => {
        this.performSearch(searchText);
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
