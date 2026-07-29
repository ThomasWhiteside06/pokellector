import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { PokemonService } from '../services/pokemon';
import { CollectionService } from '../services/collection';
import { PokemonListItem, CollectionDisplayPokemon } from '../models/pokemon-list';
import { Collection } from '../models/collection';
import { Search } from '../search/search';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [PokemonCard, Search],
  templateUrl: './collection-details.html',
  styleUrl: './collection-details.css'
})
export class CollectionDetails implements OnInit {
  collection!: Collection;
  pokemonList: PokemonListItem[] = [];
  displayPokemon: CollectionDisplayPokemon[] = [];
  filteredPokemon: CollectionDisplayPokemon[] = [];

  constructor(private route: ActivatedRoute, private pokemonService: PokemonService, private collectionService: CollectionService, private cdr:ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const collection = this.collectionService.getCollection(id);
    if (!collection) return;
    this.collection = collection;
    this.pokemonService.getPokemonListItems().subscribe(list => {
  this.pokemonList = list;
  this.displayPokemon = [];

  list.forEach(pokemon => {

    pokemon.forms.forEach(form => {

      if (!collection.selectedForms.includes(form.name)) {
        return;
      }

      if (
        collection.showGenderDifferences &&
        form.hasGenderDifference
      ) {

        this.displayPokemon.push({
          pokemon,
          artwork: form.artwork,
          shinyArtwork: form.shinyArtwork,
          formName: form.name,
          gender: 'male'
        });

        this.displayPokemon.push({
          pokemon,
          artwork: form.femaleArtwork!,
          shinyArtwork: form.femaleShinyArtwork,
          formName: form.name,
          gender: 'female'
        });

      } else {

        this.displayPokemon.push({
          pokemon,
          artwork: form.artwork,
          shinyArtwork: form.shinyArtwork,
          formName: form.name,
        });

      }

    });

  });

  console.log(
    "Displayed:",
    this.displayPokemon.length,
    "Expected:",
    collection.selectedForms.length
  );

  const displayedNames = this.displayPokemon.map(p => p.formName);

  const missing = collection.selectedForms.filter(
    form => !displayedNames.includes(form)
  );

  console.log("Missing:", missing);

  this.filteredPokemon = [...this.displayPokemon];
  this.cdr.detectChanges();
});
  }

  filterCollection(search: string) {
    this.filteredPokemon = this.collectionService.filterCollectionPokemon(this.displayPokemon, this.collection, search);
  }

  goBack() {
    this.router.navigate(['/collections']);
  }

  get totalPokemon(): number {
    return this.displayPokemon.length;
  }
}