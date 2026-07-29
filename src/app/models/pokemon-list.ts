export interface PokemonList {
  pokemon_entries: PokemonEntry[]
}

export interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  generation: number;
  region: string[];
  forms: PokemonForm[];
}

export interface PokemonEntry {
  entry_number: number;
  pokemon_species: {
    name: string;
    url: string;
  };
}

export interface PokemonInfo {
    id: number;
    types: string[];
    generation: number;
    region: string[];
}

export interface PokemonForms {
  speciesId: number;
  speciesName: string;
  forms: PokemonForm[];
}

export interface PokemonForm {
  id: number;
  pokemonId: number;
  name: string;
  formName: string;
  isDefault: boolean;
  isBattleOnly: boolean;
  isMega: boolean;
  types: string[];
  artwork: string;
  shinyArtwork:string;
  femaleArtwork?: string;
  femaleShinyArtwork?: string;
  hasGenderDifference: boolean;
}

export interface PokemonSearchResult {
  id: number;
  name: string;
  artwork: string;
  pokemonName: string;
}

export interface CollectionDisplayPokemon {
  pokemon: PokemonListItem;
  artwork: string;
  shinyArtwork?: string;
  formName: string;
  gender?: 'male' | 'female'
}