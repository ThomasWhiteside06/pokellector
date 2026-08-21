import { Component, Input } from '@angular/core';
import { Collection } from '../models/collection';
import { CollectionService } from '../services/collection';
import { PokemonListItem } from '../models/pokemon-list';
import { PokemonService } from '../services/pokemon';

@Component({
  selector: 'app-collection-card',
  standalone: true,
  templateUrl: './collection-card.html',
  styleUrl: './collection-card.css'
})
export class CollectionCard {
  @Input()
  collection!:Collection;
  pokemonList:PokemonListItem[]=[];

  constructor(private collectionService:CollectionService, private pokemonService:PokemonService){}

  ngOnInit(){
    this.pokemonService.getPokemonListItems().subscribe(list => {this.pokemonList=list});
  }

  toggleCaught(name:string){
    this.collectionService.toggleCaught(this.collection, name);
  }

  toggleShiny(name:string){
    this.collectionService.toggleShiny(this.collection, name);
  }

  getArtwork(name:string){
    for(const pokemon of this.pokemonList){
      const form = pokemon.forms.find(f=>f.name===name);
      if(form){
        if(this.collection.shiny.includes(name)){return form.shinyArtwork}
        return form.artwork;
      }
    }
    return '';
  }
}