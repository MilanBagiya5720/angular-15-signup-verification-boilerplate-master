import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { User } from '@app/_utils/_models';
import { ApiService, UserService } from '@app/_utils/_services';

@Component({
  selector: 'app-received-request',
  templateUrl: './received-request.component.html',
  styleUrls: ['./received-request.component.less']
})
export class ReceivedRequestComponent {
  @Input() usersList: User[] = [];
  selectedUser: User;

  constructor(public apiService: ApiService, private userService: UserService) {
  }

  onUserSelect(user: any) {
    this.selectedUser = user;
    this.userService.setUser(user);
    console.log(user);
  }
}
