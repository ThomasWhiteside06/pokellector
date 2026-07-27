import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavBar } from '../nav-bar/nav-bar';
import { PokemonService } from '../services/pokemon';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { PokemonListItem, PokemonForms, PokemonForm } from '../models/pokemon-list';

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
      console.log('Pokemon list:', list);
      console.log('Length:', list.length);
      this.pokemonList = list;
      this.filteredPokemonList = [...list];
      this.cdr.detectChanges();
    });
  }

  filterPokemon() {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) {
      this.filteredPokemonList = [...this.pokemonList];
      return;
    }
    
    const matchesFilter = (pokemon: PokemonListItem, filter: string) => {
      if (filter === "none") {return pokemon.types.length === 1}
      const genMatch = filter.match(/^(?:gen|generation|g)\s*(\d+)$/);
      if (genMatch) {return pokemon.generation === Number(genMatch[1]);}
      if (pokemon.region.includes(filter)) {return true;}
      if (pokemon.id.toString().includes(filter)) {return true;}
      if (pokemon.name.includes(filter)) {return true}
      if (pokemon.types.includes(filter)) {return true;}
      return false;
    }
    if (search.includes("&")) {
      const filters = search.split("&").map(x => x.trim())
      this.filteredPokemonList = this.pokemonList.filter(pokemon =>filters.every(filter => matchesFilter(pokemon, filter)))
    } else if (search.includes(",")) {
      const filters = search.split(",").map(x => x.trim())
      this.filteredPokemonList = this.pokemonList.filter(pokemon =>filters.some(filter => matchesFilter(pokemon, filter)))
    } else {
      this.filteredPokemonList = this.pokemonList.filter(pokemon =>matchesFilter(pokemon, search))
    }
  }
}