import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/_utils/_models/model';
import { UserService } from '@app/_utils/_services';
import { ApiService } from '@app/_utils/_services/api.service';
import { ChatService } from '@app/_utils/_services/chat.service';
import { SocketService } from '@app/_utils/_services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.less']
})
export class ChatContainerComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('chatMessages') private chatMessagesContainer: ElementRef;
  subscription: Subscription = new Subscription();

  selectedUser: User;
  isOnline: boolean = true;
  userId: number | null = null;
  user: any;

  message = '';
  receiverId: number | null = null;
  isTyping: boolean = false;
  groupedMessages: any[] = [];

  constructor(
    private socketService: SocketService,
    public apiService: ApiService,
    private chatService: ChatService,
    private userService: UserService,
    private router: Router) {
    this.userId = this.apiService.getUserId();
    this.user = this.apiService.getUserDetails();
  }

  ngOnInit(): void {
    this.userId = this.apiService.getUserId();
    this.getSelectedUser();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.chatMessagesContainer) {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    }
  }

  blockUser() {
    this.socketService.blockUser(this.userId, this.selectedUser.id);
  }

  getSelectedUser(): void {
    this.subscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
        this.receiverId = user.id;
        this.initData();
      }
    });
  }

  initData() {
    this.registerUser();
    this.getUserMessage();
    this.joinChat();
    this.markAsRead();
    this.listenClearChat();
    this.listenDeleteMessage();
    this.getTypingStatus();
    this.messagesRead();
    this.messageRequestResponse();
    this.getUserStatus();
    this.getIsTyping();
  }

  messagesRead(): void {
    this.subscription = this.socketService.messagesRead().subscribe((data) => {
      if (data.receiverId === this.userId) {
        this.groupedMessages.forEach((group) => {
          group.messages.forEach((message) => {
            message.isSeen = 1;
          })
        })
      }
    })
  }

  getTypingStatus(): void {
    this.subscription = this.socketService.getTypingStatus().subscribe((status) => {
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
    if (this.selectedUser.status === 'accepted' && this.selectedUser.isBlock == 0) {
      this.socketService.markMessagesAsRead(this.userId!, this.receiverId!);
    }
  }

  messageRequestResponse(): void {
    this.subscription.add(
      this.socketService.messageRequestResponse().subscribe((data) => {
        if (data.receiverId === this.userId) {
          this.selectedUser.status = data.status;
          this.getMessagesList();
        }
      })
    )
  }

  registerUser(): void {
    if (this.userId === null) {
      this.router.navigate(['/login']);
    }
  }

  getUserStatus(): void {
    this.socketService
      .updateUserStatus()
      .subscribe({
        next: (data: any) => {
          if (this.selectedUser) {
            this.selectedUser.isBlock = data.is_blocked ? 1 : 0;
            this.getMessagesList();
            this.markAsRead();
          }
        },
        error: (error: any) => {
          console.error('Failed to update user status', error);
        },
      });
  }

  getUserMessage(): void {
    this.subscription = this.socketService.receiveMessage().subscribe((message) => {
      this.markAsRead();

      const lastGroupedMessage = this.groupedMessages.length > 0
        ? this.groupedMessages[this.groupedMessages.length - 1]
        : null;

      if (lastGroupedMessage && lastGroupedMessage.timeGroup === message.timeGroup) {
        lastGroupedMessage.messages.push(message);
      } else {
        this.groupedMessages.push({
          timeGroup: message.timeGroup,
          messages: [message],
        });
      }
    });
  }

  messageRequestActions(status: string): void {
    const userName = this.user.name
    this.socketService.respondMessageRequest(
      this.receiverId,
      this.userId,
      status,
      userName
    );
  }

  joinChat(): void {
    if (this.receiverId !== null) {
      this.socketService.joinRoom(this.userId!, this.receiverId);
      this.getMessagesList();
    }
  }

  getMessagesList(): void {
    this.subscription = this.chatService
      .getMessages(this.userId!, this.receiverId)
      .subscribe((messages) => {
        this.groupedMessages = messages;
      });
  }

  typingIndicator = false;

  onInputChange() {
    this.isTyping = true;
    this.socketService.setTyping(this.userId, this.receiverId, this.isTyping);
    setTimeout(() => {
      this.isTyping = false;
      this.socketService.setTyping(this.userId, this.receiverId, this.isTyping);
    }, 3000);
  }

  getIsTyping(): void {
    this.socketService.isTyping().subscribe((data: any) => {
      if (data.senderId === this.receiverId && data.receiverId === this.userId) {
        this.typingIndicator = data.isTyping;
      }
    });
  }

  getUserAvatar(userId: number): string {
    if (userId === this.userId) {
      return '/assets/self.jpg';
    } else {
      return `/assets/avtar.jpg`;
    }
  }

  sendMessage(): void {
    this.registerUser();
    if (
      this.message.trim() &&
      this.userId !== null &&
      this.receiverId !== null
    ) {
      const message = {
        senderId: this.userId,
        receiverId: this.receiverId,
        text: this.message ?? 'test',
        sender: this.user.name,
        receiver: this.selectedUser.name,
        isSeen: 0,
        type: 'text',
        videoThumbnail: 'videoThumbnail',
        messageCreatedAt: new Date(),
        status: 'accepted',
      };
      this.socketService.sendMessage(message);
      this.message = '';
    }
  }

  sendMessageRequest(): void {
    this.socketService.sendMessageRequest(this.userId, this.receiverId, this.selectedUser.name);
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
    this.subscription = this.socketService.listenDeleteMessage().subscribe((messageId) => {
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
