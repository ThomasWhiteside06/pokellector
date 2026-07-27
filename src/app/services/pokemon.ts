import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonList } from '../models/pokemon-list';
import { PokemonListItem } from '../models/pokemon-list';
import { PokemonInfo } from '../models/pokemon-list';
import { PokemonForms } from '../models/pokemon-list';
import { forkJoin,map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class PokemonService {
    constructor(private http: HttpClient) {}
    pokemonList: PokemonListItem[] = [];
    filteredPokemonList: PokemonListItem[] = [];
    pokemonForms: PokemonForms[] = [];

    getPokemonList() {
        return (this.http.get<PokemonList>('https://pokeapi.co/api/v2/pokedex/1'))
    }

    getPokemonInfo() {
        return this.http.get<PokemonInfo[]>('assets/pokemon-info.json');
    }

    getPokemonForms() {
        return this.http.get<PokemonForms[]>('assets/pokemon-forms.json');
    }

    getPokemon(name: string) {
        return this.http.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
    }

    getPokemonListItems() {
        return forkJoin({
        pokedex: this.getPokemonList(),
        types: this.getPokemonInfo(),
        forms: this.getPokemonForms()
        }).pipe(
        map(({ pokedex, types, forms }) => {

            return pokedex.pokemon_entries.map(entry => {
                const pokemonTypes = types.find( t => t.id === entry.entry_number);
                const pokemonForms = forms.find(f => f.speciesId === entry.entry_number);
                return {
                    id: entry.entry_number,
                    name: entry.pokemon_species.name,
                    types: pokemonTypes?.types ?? [],
                    generation: pokemonTypes?.generation ?? 0,
                    region: pokemonTypes?.region ?? [],
                    forms: pokemonForms?.forms ?? []
                };
            });
        }));
    }
}
