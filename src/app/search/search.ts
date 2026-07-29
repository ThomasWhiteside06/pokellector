import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonListItem, PokemonSearchResult, CollectionDisplayPokemon } from '../models/pokemon-list';
import { PokemonService } from '../services/pokemon';

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {

  constructor(private pokemonService: PokemonService, private router: Router) {}
  @Input() pokemonList: (PokemonListItem | CollectionDisplayPokemon)[] = [];
  @Input() collectionMode = false;
  @Input() showDropdown = false;
  @Input() includeForms = false;
  @Input() navigateOnSelect = true;
  @Output() searchChanged = new EventEmitter<string>();
  @Output() pokemonSelected = new EventEmitter<PokemonSearchResult>();
  searchTerm = '';
  searchResults: PokemonSearchResult[] = [];

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value.toLowerCase().trim();
    this.searchChanged.emit(value);
    if (!this.searchTerm) {
      this.searchResults = [];
      return;
    }
    if (this.showDropdown && !this.collectionMode) {
        this.searchResults = this.pokemonService.searchPokemonWithForms(this.pokemonList as PokemonListItem[], value, this.includeForms);
    }
  }

  selectPokemon(result: PokemonSearchResult) {
    this.pokemonSelected.emit(result);
    this.searchResults = [];
    this.searchTerm = '';
    if (this.navigateOnSelect) {this.router.navigate(['/pokemon', result.name])}
  }


  formatPokemonName(name:string) {
    return name.replace(/-/g,' ').replace(/\b\w/g,c => c.toUpperCase());
  }
}