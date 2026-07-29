import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { PokemonListItem, PokemonForm, CollectionDisplayPokemon } from '../models/pokemon-list';
import { RouterLink } from '@angular/router';
import { PokemonService } from '../services/pokemon';
import { CollectionService } from '../services/collection';
import { Collection } from '../models/collection';

@Component({
  imports: [RouterLink],
  selector: 'app-pokemon-card',
  standalone: true,
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
})
export class PokemonCard{
  @Input() pokemon!: PokemonListItem;
  @Input() allowedForms: string[] | null = null;
  @Input() showFormPopup = true;
  @Input() collection: Collection | null = null;
  @Input() customArtwork?: string;
  @Input() customShinyArtwork?: string;
  @Input() gender?: 'male' | 'female';
  @ViewChild('formsPopup') formsPopup!: ElementRef;
  showForms = false;
  showFormsLeft = false;

  constructor (private pokemonService: PokemonService, private collectionService: CollectionService) {}

  formatFormName(name: string): string {
    return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  hasPermanentForms(): boolean {
    return this.visibleForms().length > 0;
  }

  checkFormPosition() {
    setTimeout(() => {
      if (!this.formsPopup) return;
      const popup = this.formsPopup.nativeElement as HTMLElement;
      const rect = popup.getBoundingClientRect();
      let offset = 0;
      if (rect.right > window.innerWidth) {offset = window.innerWidth - rect.right - 20;}
      if (rect.left < 0) {offset = -rect.left + 10;}
      popup.style.transform = `translateX(${offset}px)`;
    });
  }

  getDefaultRoute(): string {
    return (this.pokemon.forms.find(f => f.isDefault)?.name ?? this.pokemon.name);
  }

  isPermanentForm(form: PokemonForm): boolean {
    return this.pokemonService.isPermanentForm(this.pokemon, form);
  }

  visibleForms() {
    if (!this.allowedForms) {return this.pokemon.forms.filter(form => this.pokemonService.isPermanentForm(this.pokemon, form))}
    const allowedForms = this.allowedForms;
    return this.pokemon.forms.filter(form => allowedForms.includes(form.name));
  }

  isCaught(): boolean {
    if (!this.collection) return false;
    return this.getCollectionForms().some(form => this.collection!.caught.includes(form));
  }

  isShiny(): boolean {
    if (!this.collection) return false;
    return this.getCollectionForms().some(form => this.collection!.shiny.includes(form));
  }

  toggleCaught() {
    if (!this.collection) return;
    this.getCollectionForms().forEach(form => {
        const index = this.collection!.caught.indexOf(form);
        if(index >= 0) {this.collection!.caught.splice(index, 1);} else {this.collection!.caught.push(form);}
    });
    this.collectionService.updateCollection(this.collection);
  }

  toggleShiny() {
    if (!this.collection) return;
    this.getCollectionForms().forEach(form => {
        const index = this.collection!.shiny.indexOf(form);
        if(index >= 0) {this.collection!.shiny.splice(index, 1);} else {this.collection!.shiny.push(form);}
    });
    this.collectionService.updateCollection(this.collection);
  }

  getCollectionForms(): string[] {
    if (!this.allowedForms) {return this.pokemon.forms.map(form => this.getCollectionKey(form.name));}
    return this.pokemon.forms.filter(form => this.allowedForms!.includes(form.name)).map(form => this.getCollectionKey(form.name));
  }

  getArtwork(): string {
    if (this.isShiny()) {
      if (this.customShinyArtwork) {return this.customShinyArtwork;}
      return this.pokemon.forms[0].shinyArtwork;
    }
    if (this.customArtwork) {return this.customArtwork;}
    return this.pokemon.forms[0].artwork;
  }

  private getCollectionKey(formName: string): string {
    if (!this.gender) {return formName;}
    return `${formName}|${this.gender}`;
  }
}
