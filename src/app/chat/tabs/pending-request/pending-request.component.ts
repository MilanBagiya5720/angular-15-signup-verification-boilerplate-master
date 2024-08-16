import { Component, Input } from '@angular/core';
import { User } from '@app/_utils/_models';
import { ApiService, UserService } from '@app/_utils/_services';

@Component({
  selector: 'app-pending-request',
  templateUrl: './pending-request.component.html',
  styleUrls: ['./pending-request.component.less']
})
export class PendingRequestComponent {
  @Input() usersList: User[] = [];
  selectedUser: User;

  constructor(public apiService: ApiService, private userService: UserService) {
  }

  onUserSelect(user: any) {
    this.selectedUser = user;
    this.userService.setUser(user);
  }
}
