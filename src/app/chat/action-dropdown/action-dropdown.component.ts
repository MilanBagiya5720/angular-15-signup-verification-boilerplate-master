import { SocketService } from './../../_utils/_services/socket.service';
import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@app/_utils/_models';
import { ChatService } from '@app/_utils/_services';

@Component({
  selector: 'app-action-dropdown',
  templateUrl: './action-dropdown.component.html',
  styleUrls: ['./action-dropdown.component.less']
})
export class ActionDropdownComponent {
  isOpen: boolean = false;
  @Input() selectedUser: User;
  @Input() userId: number;
  @Input() receiverId: number;

  constructor(private socketService: SocketService, private dialog: MatDialog) {
    this.getUserStatus();
  }

  getUserStatus(): void {
    this.socketService
      .updateUserStatus()
      .subscribe({
        next: (data: any) => {
          if (this.selectedUser) {
            this.selectedUser.isBlock = data.is_blocked ? 1 : 0
          }
        },
        error: (error: any) => {
          console.error('Failed to update user status', error);
        },
      });
  }

  get isUserBlocked(): boolean {
    return !!this.selectedUser?.isBlock;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  clearChat() {
    this.socketService.clearChat(this.userId, this.receiverId);
  }

  openDialog(action: 'clear' | 'block' | 'unblock'): void {
    const isBlocked = this.isUserBlocked;

    if (action === 'block' && isBlocked) {
      action = 'unblock';
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {
        flag: action,
        title: this.getDialogTitle(action),
        message: this.getDialogMessage(action),
        confirmText: this.getDialogConfirmText(action),
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isOpen = false;
      if (result.data) {
        this.performAction(result.flag);
      } else {
        console.log('Action cancelled');
      }
    });
  }

  private getDialogTitle(action: 'clear' | 'block' | 'unblock'): string {
    return action === 'clear' ? 'Confirm Clear Chat' :
      action === 'block' ? 'Confirm Block User' : 'Confirm Unblock User';
  }

  private getDialogMessage(action: 'clear' | 'block' | 'unblock'): string {
    return action === 'clear' ? 'Are you sure you want to clear the chat?' :
      action === 'block' ? 'Are you sure you want to block this user?' :
        'Are you sure you want to unblock this user?';
  }

  private getDialogConfirmText(action: 'clear' | 'block' | 'unblock'): string {
    return action === 'clear' ? 'Clear' :
      action === 'block' ? 'Block' : 'Unblock';
  }

  private performAction(flag: 'clear' | 'block' | 'unblock'): void {
    if (flag === 'clear') {
      this.clearChat();
    } else if (flag === 'block') {
      this.blockUser();
    } else if (flag === 'unblock') {
      this.unblockUser();
    }
  }

  blockUser(): void {
    this.socketService.blockUser(this.receiverId, this.userId,);
  }

  unblockUser(): void {
    this.socketService.unBlockUser(this.receiverId, this.userId,);
    this.selectedUser.isBlock = 0;
  }
}
