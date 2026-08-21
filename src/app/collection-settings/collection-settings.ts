import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonService } from '../services/pokemon';
import { CollectionService } from '../services/collection';
import { PokemonListItem, PokemonSearchResult} from '../models/pokemon-list';
import { FormsModule } from '@angular/forms';
import { Search } from '../search/search';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-collection-settings',
  standalone: true,
  imports: [FormsModule, Search],
  templateUrl: './collection-settings.html',
  styleUrl: './collection-settings.css'
})
export class CollectionSettings implements OnInit {

  constructor(private pokemonService: PokemonService, private collectionService: CollectionService, private router: Router, private cdr:ChangeDetectorRef) {}
  pokemonList: PokemonListItem[] = [];
  allPokemonOptions: PokemonSearchResult[] = [];
  displayPokemon: PokemonSearchResult[] = [];
  filteredPokemon: PokemonSearchResult[] = [];
  search = '';
  searchResults: PokemonSearchResult[] = [];
  selectedForms: PokemonSearchResult[] = [];
  toggleAllMode = false;
  toggleStartIndex: number | null = null;
  toggleStartPokemon: PokemonSearchResult | null = null;
  collectionName = '';
  showGenderDifferences = false;

  ngOnInit() {
    this.pokemonService.getPokemonListItems().subscribe(list => {
        this.pokemonList = list;
        this.displayPokemon = [];
        list.forEach(pokemon => {
            pokemon.forms.forEach(form => {
                if (!this.pokemonService.isCollectionForm(form)) {return}
                this.displayPokemon.push({id: form.pokemonId, name: form.name, pokemonName: pokemon.name, artwork: form.artwork});
            });
        });
        this.filteredPokemon = [...this.displayPokemon];
        this.cdr.detectChanges()
    });
}

  onSearch(event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    this.searchResults = this.pokemonService.searchPokemonWithForms(this.pokemonList, this.search, true);
  }

  isSelected(result: PokemonSearchResult) {
    return this.selectedForms.some(p => p.name === result.name);
  }

  togglePokemon(result: PokemonSearchResult) {
    const exists = this.selectedForms.some(p => p.name === result.name);
    if(exists){this.selectedForms = this.selectedForms.filter(p => p.name !== result.name)} else {this.selectedForms.push(result)}
  }

  createCollection() {
    if (!this.collectionName.trim()) {alert('Please enter a collection name'); return}
    if (!this.selectedForms.length) {alert('Please select at least one Pokémon'); return}
    this.collectionService.createCollection(this.collectionName, this.selectedForms.map(p => p.name), this.showGenderDifferences);
    this.router.navigate(['/collections']);
  }

  formatName(name: string) {
    return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  selectPokemon(result: PokemonSearchResult) {
    if (!this.toggleAllMode) {
        this.togglePokemon(result);
        return;
    }
    const index = this.filteredPokemon.findIndex(pokemon => pokemon.name === result.name);
    if (this.toggleStartIndex === null) {
        this.toggleStartIndex = index;
        this.toggleStartPokemon = result;
        return;
    }
    const start = Math.min(this.toggleStartIndex, index);
    const end = Math.max(this.toggleStartIndex, index);
    const range = this.filteredPokemon.slice(start, end + 1);
    const allSelected = range.every(pokemon =>this.isSelected(pokemon));
    if (allSelected) {this.selectedForms = this.selectedForms.filter(selected =>!range.some(pokemon => pokemon.name === selected.name));} else {range.forEach(pokemon => {if (!this.isSelected(pokemon)) {this.selectedForms.push(pokemon);}});}
    this.toggleAllMode = false;
    this.toggleStartIndex = null;
    this.toggleStartPokemon = null;
  }

  toggleAllSelectionMode() {
    this.toggleAllMode = !this.toggleAllMode;
    this.toggleStartIndex = null;
  }

  filterSelectionList(search: string) {
    const value = search.toLowerCase().trim();
    if (!value) {
        this.filteredPokemon = [...this.displayPokemon];
        return;
    }
    this.filteredPokemon = this.displayPokemon.filter(pokemon =>pokemon.name.includes(value) || pokemon.pokemonName.includes(value));
  }

  isToggleStart(result: PokemonSearchResult): boolean {
    return this.toggleStartPokemon?.id === result.id;
  }

  selectAllPokemon() {
    if (this.selectedForms.length === this.displayPokemon.length) {this.selectedForms = [];} else {this.selectedForms = [...this.displayPokemon];}
  }

  formatFormName(formName: string, speciesName: string): string {
    const ignoredForms = ['koraidon-apex-build', 'miraidon-ultimate-mode'];
    if (ignoredForms.includes(formName)) {return ''}
    let name = formName;
    if (name.startsWith(speciesName + '-')) {name = name.substring(speciesName.length + 1);}
    return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  goBack() {
    this.router.navigate(['/collections']);
  }
}