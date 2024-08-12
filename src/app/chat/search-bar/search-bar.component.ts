import { Component } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less']
})
export class SearchBarComponent {
  searchQuery = '';

  onSearch(query: string) {
    // Implement search logic here
    console.log('Search query:', query);
  }
}
