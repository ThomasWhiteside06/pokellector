import { Injectable } from '@angular/core';
import { Collection } from '../models/collection';
import { CollectionDisplayPokemon, PokemonListItem } from '../models/pokemon-list';

@Injectable({
  providedIn:'root'
})
export class CollectionService {
  collections: Collection[] = [];

  constructor () {
    this.loadCollections();
  }

  loadCollections(){
    const saved = localStorage.getItem('collections');
    if(saved){this.collections = JSON.parse(saved)}
  }

  saveCollections(){
    localStorage.setItem('collections', JSON.stringify(this.collections));
  }

  createCollection(name:string, selectedForms:string[], showGenderDifferences:boolean = false){
    const collection:Collection = {
      id: crypto.randomUUID(),
      name: name,
      selectedForms: selectedForms,
      caught:[],
      shiny:[],
      showGenderDifferences,
      createdAt:Date.now()
    };
    this.collections.push(collection);
    this.saveCollections();
    return collection;
  }

  toggleCaught(collection:Collection, pokemon:string){
    if (collection.caught.includes(pokemon)) {collection.caught = collection.caught.filter(x=>x!==pokemon);} else {collection.caught.push(pokemon);}
    this.saveCollections();
  }

  toggleShiny(collection:Collection, pokemon:string){
    if (collection.shiny.includes(pokemon)){collection.shiny = collection.shiny.filter(x=>x!==pokemon)} else {collection.shiny.push(pokemon);}
    this.saveCollections();
  }

  deleteCollection(id:string){
    this.collections = this.collections.filter(collection => collection.id !== id);
    this.saveCollections();
  }

  getCollection(id: string): Collection | undefined {
    return this.collections.find(c => c.id === id);
  }

  filterCollectionPokemon(
    pokemonList: CollectionDisplayPokemon[],
    collection: Collection,
    searchTerm: string
): CollectionDisplayPokemon[] {
    const search = searchTerm.toLowerCase().trim();
    if (!search) {
        return [...pokemonList];
    }
    return pokemonList.filter(item => {
        const pokemon = item.pokemon;
        return (
            pokemon.name.includes(search) ||
            pokemon.id.toString().includes(search) ||
            item.formName.includes(search)
        );
    });
  }

  updateCollection(collection: Collection) {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === collection.id);
    if(index !== -1) {collections[index] = collection;}
    localStorage.setItem('collections', JSON.stringify(collections));
  }

  getCollections(): Collection[] {
    const data = localStorage.getItem('collections');
    if(!data) return [];
    return JSON.parse(data).map((collection: Collection) => ({...collection, caught: collection.caught ?? [], shiny: collection.shiny ?? [], showGenderDifferences: collection.showGenderDifferences ?? false}));
  }

  getCollectionCount(collection: Collection, pokemonList: PokemonListItem[]): number {
    let count = 0;
    pokemonList.forEach(pokemon => {
      pokemon.forms.forEach(form => {
        if (!collection.selectedForms.includes(form.name)) {return;}
        if (collection.showGenderDifferences && form.hasGenderDifference) {count += 2;} else {count++;}
      });
    });

    return count;
  }
}