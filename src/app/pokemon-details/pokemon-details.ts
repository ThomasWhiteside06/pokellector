import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../services/pokemon';
import { PokemonListItem, PokemonForm } from '../models/pokemon-list';

@Component({
  selector: 'app-pokemon-details',
  standalone: true,
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css'
})
export class PokemonDetails implements OnInit {
  pokemon: any | null = null;
  pokemonDetails: PokemonListItem | null = null;
  selectedForm: PokemonForm | null = null;

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const name = params.get('name');
      if (!name) {return}
        this.pokemon = null;
        this.pokemonDetails = null;
        this.pokemonService.getPokemon(name).subscribe(data => {
        this.pokemon = data;
      });
      this.pokemonService.getPokemonListItems().subscribe(list => {
        const species = list.find(pokemon => pokemon.name === name || pokemon.forms.some(form => form.name === name));
        this.pokemonDetails = species ?? null;
        if (species) {this.selectedForm = species.forms.find(form => form.name === name) ?? species.forms.find(form => form.isDefault) ?? null;}
        this.cdr.detectChanges();
      });
    });
  }

  formatPokemonName(): string {
    if (!this.pokemonDetails) {return '';}
    if (!this.selectedForm || this.selectedForm.name === this.pokemonDetails.name) {return this.capitalize(this.pokemonDetails.name);}
    const formName = this.selectedForm.formName || this.selectedForm.name;
    return `${this.capitalize(formName)} ${this.capitalize(this.pokemonDetails.name)}`;
  }
    capitalize(value: string): string {return value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  }
}