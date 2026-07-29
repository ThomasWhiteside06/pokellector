import { Component, Output, EventEmitter, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Search } from '../search/search';
import { PokemonListItem } from '../models/pokemon-list';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, Search, FormsModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  @Input() pokemonList: PokemonListItem[] = [];
  @Input() showSearchDropdown = false;
  @Input() includeForms = false;
  @Output() searchChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<string>();

  sortOption = 'number';
  showSort = false;

  changeSort(sort: string) {
      this.sortChanged.emit(sort);
      this.showSort = false;
  }
}