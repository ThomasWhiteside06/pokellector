import { Component, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { PokemonListItem } from '../models/pokemon-list';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
})
export class PokemonCard implements OnChanges{
  @Input() pokemon!: PokemonListItem;
  @ViewChild('formsPopup') formsPopup!: ElementRef;
  showForms = false;
  showFormsLeft = false;

  constructor () {
    console.log('PokemonCard CREATED');
  }

  ngOnChanges() {
    console.log('PokemonCard received:', this.pokemon);
  }

  formatFormName(name: string): string {return name.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());}

  hasPermanentForms(): boolean {
    return this.pokemon?.forms?.some(form =>
      this.isPermanentForm(form)
    ) ?? false;
  }

  isPermanentForm(form: any): boolean {
    const nonPermanentKeywords = [
      "cap",
      "partner",
      "cosplay",
      "rock-star",
      "belle",
      "pop-star",
      "phd",
      "libre",
      "original",
      "world",
      "power-construct",
      "totem",
      "battle-bond",
    ];

    if (form.name.includes('crowned') || form.name.includes('terastal') || form.name.includes('school') || form.name.includes('complete') || form.name.includes('ash') || form.name.includes('pirouette') || form.name.includes('zen') && form.name !== 'finizen' || form.name.includes('sunshine') || form.name.includes('arceus') && form.name !== 'arceus-normal' || form.name.includes('silvally') || form.name.includes('mega') && form.name !== 'meganium' && form.name !== 'yanmega' || form.name.includes('gmax') || form.name.includes('gigatamax') || form.name.includes('burmy') && form.name !== 'burmy-plant') {return true}

    return (
      form.pokemonId !== this.pokemon.id &&
      !form.isBattleOnly &&
      !form.isMega &&
      !nonPermanentKeywords.some(keyword =>
        form.name.includes(keyword)
      )
    );
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
}
