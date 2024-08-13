import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat.component';
import { TabsComponent } from './tabs/tabs.component';
import { NavbarComponent } from './navbar/navbar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatContainerComponent } from './chat-container/chat-container.component';

@NgModule({
  declarations: [
    ChatComponent,
    UserListComponent,
    SidebarComponent,
    SearchBarComponent,
    TabsComponent,
    NavbarComponent,
    ChatContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    ChatRoutingModule
  ],
  exports: [NavbarComponent, ChatContainerComponent]
})
export class ChatModule { }
