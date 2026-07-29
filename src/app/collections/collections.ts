import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CollectionService } from '../services/collection';
import { PokemonListItem } from '../models/pokemon-list';
import { PokemonService } from '../services/pokemon';
import { forkJoin } from 'rxjs';
import { Collection } from '../models/collection';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './collections.html',
  styleUrl: './collections.css'
})
export class Collections {
  creatingPreset = false;
  pokemonList: PokemonListItem[] = [];

  constructor(private collectionService:CollectionService, private router: Router, public pokemonService: PokemonService, private cdr:ChangeDetectorRef){}

  ngOnInit() {
    this.pokemonService.getPokemonListItems()
      .subscribe(pokemon => {
        this.pokemonList = pokemon;
        console.log(
                "Basculegion:",
                pokemon.find(p => p.id === 902)
            );

            console.log(
                "Enamorus:",
                pokemon.find(p => p.id === 905)
            );
        this.cdr.detectChanges();
      });
      
  }

  get collections(){
    return this.collectionService.collections;
  }

  deleteCollection(id:string){
    this.collectionService.deleteCollection(id);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  createPreset(pokedex: string, name: string) {
    if (this.creatingPreset) {return;}
    this.creatingPreset = true;
    if (pokedex === 'kalos') {
        forkJoin([this.pokemonService.getPresetCollection('kalos-central'), this.pokemonService.getPresetCollection('kalos-coastal'),this.pokemonService.getPresetCollection('kalos-mountain')])
        .subscribe({
            next: ([central, coastal, mountain]) => {
                const kalos = [...central, ...coastal, ...mountain];
                const uniqueKalos = [...new Set(kalos)];
                this.collectionService.createCollection(name, uniqueKalos);
                this.creatingPreset = false;
                this.cdr.detectChanges();
            },
            error: error => {
                console.error(error);
                this.creatingPreset = false;
                this.cdr.detectChanges();
            }
        });
    } else {
        this.pokemonService.getPresetCollection(pokedex)
        .subscribe({
            next: pokemon => {
                this.collectionService.createCollection(name, pokemon);
                this.creatingPreset = false;
                this.cdr.detectChanges();
            },
            error: error => {
                console.error(error);
                this.creatingPreset = false;
                this.cdr.detectChanges();
            }
        });
    }
  }

  createNationalPreset() {
    const selectedForms = this.pokemonList.map(pokemon => {
        const defaultForm = pokemon.forms.find(form => form.isDefault);
        return defaultForm?.name ?? pokemon.name;
    });
    this.collectionService.createCollection(
        'National Pokédex',
        selectedForms,
        false
    );
    this.cdr.detectChanges();
  }

  createRegionPreset(region: string, name: string) {
    const selectedForms = this.pokemonList.filter(pokemon => pokemon.region.includes(region)).map(pokemon => {
            const defaultForm = pokemon.forms.find(form => form.isDefault);
            return defaultForm?.name ?? pokemon.name;
        });
    this.collectionService.createCollection(name, selectedForms);
    this.cdr.detectChanges();
  }

  getCollectionCount(collection: Collection): number {
    let count = 0;
    this.pokemonList.forEach(pokemon => {
      pokemon.forms.forEach(form => {
        if (!collection.selectedForms.includes(form.name)) {return;}
        if (collection.showGenderDifferences && form.hasGenderDifference) {count += 2;} else {count++;}
      });
    });
    return count;
  }
}