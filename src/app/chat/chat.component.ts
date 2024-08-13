import { Component, OnInit } from '@angular/core';
import { User } from '@app/_utils/_models';
import { UserService } from '@app/_utils/_services';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {
  selectedUser: User;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.user$.subscribe(user => {
      if (user) {
        this.selectedUser = user;
      }
    });
  }
}
