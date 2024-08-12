import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat.component';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [{
  path: '',
  component: ChatComponent,
}, {
  path: 'users',
  component: UserListComponent,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }
