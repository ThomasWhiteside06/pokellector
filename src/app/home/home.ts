import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavBar } from '../nav-bar/nav-bar';
import { PokemonService } from '../services/pokemon';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { PokemonListItem, PokemonForms } from '../models/pokemon-list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavBar, PokemonCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  constructor(private pokemonService: PokemonService, private cdr: ChangeDetectorRef) {}
  pokemonList: PokemonListItem[] = [];
  filteredPokemonList: PokemonListItem[] = [];
  pokemonForms: PokemonForms[] = [];
  searchTerm = '';

  ngOnInit() {
    this.pokemonService.getPokemonListItems().subscribe(list => {
      this.pokemonList = list;
      this.filteredPokemonList = [...list];
      this.cdr.detectChanges();
    });
  }

  onSearch(search: string) {
    this.filteredPokemonList = this.pokemonService.filterPokemon(this.pokemonList, search);
  }

  sortPokemon(sort: string) {
    if(sort === 'name') {this.filteredPokemonList.sort((a,b) =>a.name.localeCompare(b.name));} else {this.filteredPokemonList.sort((a, b) =>a.id - b.id);}
  }
}