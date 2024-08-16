import { SocketService } from './../../_utils/_services/socket.service';
import { Component, Input } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-action-dropdown',
  templateUrl: './action-dropdown.component.html',
  styleUrls: ['./action-dropdown.component.less']
})
export class ActionDropdownComponent {
  @Input() userId: number | null = null;
  @Input() receiverId: number | null = null;

  isOpen = false;

  constructor(private socketService: SocketService, private dialog: MatDialog) {
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  clearChat() {
    this.socketService.clearChat(this.userId, this.receiverId);
  }

  blockUser() {
    this.socketService.blockUser(this.userId, this.receiverId);
  }

  openDialog(action: 'clear' | 'block'): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {
        flag: action,
        title: action === 'clear' ? 'Confirm Clear Chat' : 'Confirm Block User',
        message: action === 'clear' ? 'Are you sure you want to clear the chat?' : 'Are you sure you want to block this user?',
        confirmText: action === 'clear' ? 'Clear' : 'Block',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isOpen = false;
      if (result.data && result.flag === 'clear') {
        this.clearChat();
      } else if (result.data && result.flag === 'block') {
        this.blockUser();
      } else {
        console.log('Action cancelled');
      }
    });
  }
}
