import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { RelativeTimePipe } from '@app/_utils/_pipe/relative-time.pipe';
import { ActionDropdownComponent } from './action-dropdown/action-dropdown.component';
import { BlankContainerComponent } from './blank-container/blank-container.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PendingRequestComponent } from './tabs/pending-request/pending-request.component';
import { ReceivedRequestComponent } from './tabs/received-request/received-request.component';
import { TabsComponent } from './tabs/tabs.component';
import { UserListComponent } from './user-list/user-list.component';
import { ConfirmationDialogComponent } from './action-dropdown/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [
    ChatComponent,
    UserListComponent,
    SidebarComponent,
    SearchBarComponent,
    TabsComponent,
    NavbarComponent,
    ChatContainerComponent,
    BlankContainerComponent,
    PendingRequestComponent,
    ReceivedRequestComponent,
    ActionDropdownComponent,
    ConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    ChatRoutingModule,
    RelativeTimePipe
  ],
  providers: [RelativeTimePipe],
  exports: [NavbarComponent, ChatContainerComponent]
})
export class ChatModule { }
