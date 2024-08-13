import { SocketService } from '@app/_utils/_services/socket.service';
import { Component, HostListener, Input } from '@angular/core';
import { ApiService } from '@app/_utils/_services/api.service';
import { User } from '@app/_utils/_models/model';
import { Router } from '@angular/router';
import { ChatService } from '@app/_utils/_services/chat.service';
import { UserService } from '@app/_utils/_services';


@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.less']
})
export class ChatContainerComponent {
  selectedUser: User = {} as User;
  isOnline: boolean = true;
  userId: number | null = null;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private chatService: ChatService,
    private userService: UserService,
    private router: Router) {
    this.userId = this.apiService.getUserId();
  }

  blockUser() {
    this.socketService.blockUser(this.userId, this.selectedUser.id);
  }

  message = '';
  receiverId: number | null = null;
  isTyping: boolean = false;

  groupedMessages: any[] = [];

  ngOnInit(): void {
    this.userId = this.apiService.getUserId();
    this.getSelectedUser();
  }

  getSelectedUser(): void {
    this.userService.user$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
        this.receiverId = user.id;

        this.registerUser();
        this.getUserMessage();
        this.joinChat();
        this.markAsRead();
        this.listenClearChat();
        this.listenDeleteMessage();
        this.getMessageRequest();
        this.getTypingStatus();
      }
    });
  }

  getTypingStatus(): void {
    this.socketService.getTypingStatus().subscribe((status) => {
      if (status.receiverId === this.userId) {
        this.isTyping = status.isTyping;
      }
    });
  }

  @HostListener('document:keypress', ['$event'])
  @HostListener('document:input', ['$event'])
  @HostListener('document:focusout', ['$event'])
  onTyping(event?: KeyboardEvent | Event): void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }
    if (!this.selectedUser || this.selectedUser?.status !== 'accepted') {
      return;
    }
    this.isTyping = event ? true : false;
    this.socketService.setTypingStatus(
      this.userId!,
      this.receiverId!,
      this.isTyping
    );
  }

  markAsRead(): void {
    this.socketService.markMessagesAsRead(this.userId!, this.receiverId!);
  }

  registerUser(): void {
    if (this.userId === null) {
      this.router.navigate(['/login']);
    }
  }

  getUserMessage(): void {
    this.socketService.receiveMessage().subscribe((message) => {
      const lastMessage = this.groupedMessages.length
        ? this.groupedMessages[this.groupedMessages.length - 1]
        : null;
      if (lastMessage && lastMessage.timeGroup === message.timeGroup) {
        lastMessage.messages.push(message);
      } else {
        this.groupedMessages.push({
          timeGroup: message.timeGroup,
          messages: [message],
        });
      }
    });
  }

  joinChat(): void {
    if (this.receiverId !== null) {
      this.socketService.joinRoom(this.userId!, this.receiverId);
      this.chatService
        .getMessages(this.userId!, this.receiverId)
        .subscribe((messages) => {
          this.groupedMessages = messages;
        });
    }
  }

  getUserAvatar(userId: number): string {
    if (userId === this.userId) {
      return '/assets/self.jpg';
    } else {
      return `/assets/avtar.jpg`;
    }
  }

  sendMessage(): void {
    if (
      this.message.trim() &&
      this.userId !== null &&
      this.receiverId !== null
    ) {
      const message = {
        senderId: this.userId,
        receiverId: this.receiverId,
        text: this.message,
        sender: 'self',
        receiver: 'receiver',
        isSeen: 0,
        type: 'text',
        videoThumbnail: 'videoThumbnail',
        messageCreatedAt: new Date(),
        status: 'accepted',
      };
      this.socketService.sendMessage(message);
      this.message = '';
    }

    if (this.selectedUser.status === 'new') {
      this.sendMessageRequest();
    }
  }

  public sendMessageRequest(): void {
    this.socketService.sendMessageRequest(this.userId, this.receiverId);
  }

  clearChat(): void {
    this.socketService.clearChat(this.userId, this.receiverId);
  }

  deleteMessage(message): void {
    this.socketService.deleteMessage(this.userId, this.receiverId, message.messageId);
  }

  listenClearChat(): void {
    this.socketService.listenClearChat().subscribe(() => {
      this.groupedMessages = [];
    });
  }

  listenDeleteMessage(): void {
    this.socketService.listenDeleteMessage().subscribe((messageId) => {
      this.groupedMessages = this.groupedMessages.map((group) => ({
        ...group,
        messages: group.messages.filter(
          (message) => message.messageId !== messageId
        ),
      }));
    });
  }

  formatTime(timestamp?: string): string {
    const date = timestamp ? new Date(timestamp) : new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  respondMessageRequest(status: string): void {
    this.socketService.respondMessageRequest(
      this.receiverId,
      this.userId,
      status
    );
  }

  private getMessageRequest(): void {
    this.socketService.receiveRequest().subscribe(
      ({ senderId, message, senderName }: any) => {
        debugger;
        // const user = this.users.find((u) => u.id === senderId);
        // if (user) {
        //   user.lastMessage = message;
        //   this.messageRequests.push({
        //     senderId,
        //     senderName,
        //     lastMessage: message,
        //   });

        //   this.toast.success(`Message request from ${user.name}`, message);
        // }
      },
      (error) => {
        // this.toast.error('Failed to receive message request', '');
        console.error('Failed to receive message request', error);
      }
    );

    this.socketService.messageRequestResponse().subscribe(
      ({ receiverId, status }: any) => {
        debugger;
        // // const user = this.users.find((u) => u.id === receiverId);
        // if (user) {
        //   user.status = status;
        // }
      },
      (error) => {
        console.error('Failed to handle message request response', error);
      }
    );
  }
}
