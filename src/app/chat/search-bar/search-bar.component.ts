import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less']
})
export class SearchBarComponent {
  @Output() searchUser: EventEmitter<string> = new EventEmitter<string>();

  onSearch(event: any) {
    this.searchUser.emit(event.target.value);
  }
}
