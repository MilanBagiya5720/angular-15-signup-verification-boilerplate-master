import { Subject, Subscription } from 'rxjs';
import { SocketService } from '@app/_utils/_services/socket.service';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, OnDestroy, Pipe, ViewChild } from '@angular/core';
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
export class ChatContainerComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('chatMessages') private chatMessagesContainer: ElementRef;
  subscription: Subscription = new Subscription();

  selectedUser: User;
  isOnline: boolean = true;
  userId: number | null = null;

  constructor(
    private socketService: SocketService,
    public apiService: ApiService,
    private chatService: ChatService,
    private userService: UserService,
    private router: Router) {
    this.userId = this.apiService.getUserId();
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

  updateMessage(message: any) {
    const chatHistory = message;
    for (let i = 0; i < chatHistory.length; i++) {
      for (let j = 0; j < chatHistory[i].messages!.length; j++) {
        if (message['messageId'] == null) {
          chatHistory[i].messages![j].isSeen = 1;
        } else if (chatHistory[i].messages![j].messageId === message['messageId']) {
          chatHistory[i].messages![j].isSeen = 1;
        }
      }
    }
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
    this.subscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
        this.receiverId = user.id;

        this.registerUser();
        this.getUserMessage();
        this.joinChat();
        this.markAsRead();
        this.listenClearChat();
        this.listenDeleteMessage();
        this.getTypingStatus();
        this.messagesRead();
      }
    });
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
    this.socketService.markMessagesAsRead(this.userId!, this.receiverId!);
  }

  registerUser(): void {
    if (this.userId === null) {
      this.router.navigate(['/login']);
    }
  }

  getUserMessage(): void {
    this.subscription = this.socketService.receiveMessage().subscribe((message) => {
      this.markAsRead();

      // Get the last grouped message
      const lastGroupedMessage = this.groupedMessages.length > 0
        ? this.groupedMessages[this.groupedMessages.length - 1]
        : null;

      if (lastGroupedMessage && lastGroupedMessage.timeGroup === message.timeGroup) {
        // Add the new message to the existing group
        lastGroupedMessage.messages.push(message);
      } else {
        // Create a new group for the new timeGroup
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
      this.subscription = this.chatService
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
        sender: this.selectedUser.name,
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

  respondMessageRequest(status: string): void {
    this.socketService.respondMessageRequest(
      this.receiverId,
      this.userId,
      status
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
