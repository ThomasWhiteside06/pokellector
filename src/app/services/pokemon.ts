import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonList, PokemonListItem, PokemonInfo, PokemonSearchResult, PokemonForms, PokemonForm } from '../models/pokemon-list';
import { forkJoin,map } from 'rxjs';
import { Observable } from 'rxjs';

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
        return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon/${name}`);
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
                    forms: pokemonForms?.forms.map(form => ({...form, shinyArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${form.pokemonId}.png`})) ?? []
                }
            })
        }));
    }

    filterPokemon(pokemonList: PokemonListItem[], searchTerm: string): PokemonListItem[] {
        const search = searchTerm.toLowerCase().trim();
        if (!search) {return [...pokemonList];}
        const matchesFilter = (pokemon: PokemonListItem, filter: string) => {
            if (filter === "none") {return pokemon.types.length === 1;}
            const genMatch = filter.match(/^(?:gen|generation|g)\s*(\d+)$/);
            if (genMatch) {return pokemon.generation === Number(genMatch[1]);}
            if (pokemon.region.includes(filter)) {return true;}
            if (pokemon.id.toString().includes(filter)) {return true;}
            if (pokemon.name.includes(filter)) {return true;}
            if (pokemon.types.includes(filter)) {return true;}
            return false;
        };
        if (search.includes("&")) {
            const filters = search.split("&").map(x => x.trim())
            return pokemonList.filter(pokemon =>filters.every(filter => matchesFilter(pokemon, filter)));
        } else if (search.includes(",")) {
            const filters = search.split(",").map(x => x.trim());
            return pokemonList.filter(pokemon =>filters.some(filter => matchesFilter(pokemon, filter)));
        } else {
            return pokemonList.filter(pokemon =>matchesFilter(pokemon, search));
        }
    }

    searchPokemon(pokemonList: PokemonListItem[], searchTerm: string, includeForms: boolean = false): PokemonListItem[] {
        const search = searchTerm.toLowerCase().trim();
        if (!search) {return [];}
        return pokemonList.filter(pokemon => {
            if (pokemon.name.includes(search) || pokemon.id.toString().includes(search)) {return true;}
            if (includeForms) {return pokemon.forms.some(form => form.name.includes(search) || form.formName.includes(search));}
            return false;
        });
    }

    searchPokemonWithForms(pokemonList: PokemonListItem[], searchTerm: string, includeForms: boolean): PokemonSearchResult[] {
        const search = searchTerm.toLowerCase().trim();
        const results: PokemonSearchResult[] = [];
        pokemonList.forEach(pokemon => {
            const defaultForm = pokemon.forms.find(f => f.isDefault);
            if (pokemon.name.includes(search) || pokemon.id.toString().includes(search)) {results.push({id: pokemon.id, name: defaultForm?.name ?? pokemon.name, pokemonName: pokemon.name, artwork: defaultForm?.artwork ?? pokemon.forms[0]?.artwork});}
            if (includeForms) {pokemon.forms.forEach(form => {
                if (form.name === pokemon.name && form.isDefault) {return}
                if (!this.isPermanentForm(pokemon, form)) {return}
                if (form.name.includes(search) || form.formName.includes(search)) {results.push({id: form.pokemonId, name: form.name, pokemonName: pokemon.name, artwork: form.artwork})}
            });}
        });
        return results;
    }

    isPermanentForm(pokemon: PokemonListItem, form: PokemonForm): boolean {
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
        "three",
        "own-tempo"
        ];
        
        if (form.name.includes('crowned') || form.name.includes('terastal') || form.name.includes('school') || form.name.includes('complete') || form.name.includes('ash') || form.name.includes('pirouette') || form.name.includes('zen') && form.name !== 'finizen' || form.name.includes('sunshine') || form.name.includes('arceus') && form.name !== 'arceus-normal' || form.name.includes('silvally') || form.name.includes('mega') && form.name !== 'meganium' && form.name !== 'yanmega' || form.name.includes('gmax') || form.name.includes('gigatamax') || form.name.includes('burmy') && form.name !== 'burmy-plant') {return true}

        return (
            form.pokemonId !== pokemon.id &&
            !form.isBattleOnly &&
            !form.isMega &&
            !nonPermanentKeywords.some(keyword => form.name.includes(keyword))
        );
    }

    getCollectionOptions(
        pokemonList:PokemonListItem[]){
        const results:any[]=[];
        pokemonList.forEach(pokemon=>{pokemon.forms.forEach(form=>{results.push({name:form.name, artwork:form.artwork, shinyArtwork:form.shinyArtwork, species:pokemon.name});});});
        return results;
    }

    isCollectionForm(form: PokemonForm): boolean {
        const excludedKeywords = [
            "mega",
            "primal",
            "gmax",
            "gigantamax",
            "crowned",
            "origin",
            "battle",
            "totem",
            "school",
            "complete",
            "ash",
            "zen",
            "pirouette",
            "sunshine",
            "own-tempo",
            "rock-star",
            "pop-star",
            "libre",
            "belle",
            "phd",
            "cosplay",
            "starter",
            "spiky-eared",
            "sunny",
            "rainy",
            "snowy",
            "arceus",
            "silvally",
            "genesect-",
            "xerneas-active",
            "meteor",
            "busted",
            "cramorant-",
            "noice",
            "hangry",
            "ogerpon-",
            "terapagos-",
            "kyurem-",
            "necrozma-",
            "palafin-hero",
            "-female",
            "small",
            "large",
            "super",
            "limited",
            "sprinting",
            "swimming",
            "gliding",
            "low-power",
            "glide",
            "drive",
            "aquatic",
            "icy-snow",
            "polar",
            "tundra",
            "continental",
            "garden",
            "elegant",
            "modern",
            "marine",
            "archipelago",
            "high-plains",
            "sandstorm",
            "river",
            "monsoon",
            "savanna",
            "sun",
            "ocean",
            "jungle",
            "fancy",
            "poke-ball",
            "sandy"
        ];

        return !excludedKeywords.some(keyword =>form.name.includes(keyword)) || form.name === 'arceus-normal' || form.name === 'silvally-normal' || form.name === 'finizen' || form.name.includes("vivillon") || form.name === 'magearna-original' || form.name.includes("burmy") || form.name.includes("wormadam") || form.name === "pikachu-original-cap";
    }

    getPokedex(name: string) {
        return this.http.get<any>(`https://pokeapi.co/api/v2/pokedex/${name}`);
    }

    getPresetCollection(pokedexName: string) {
        return this.getPokedex(pokedexName).pipe(map(pokedex => {return pokedex.pokemon_entries.map((entry: any) => entry.pokemon_species.name);}));
    }

    getPokemonSpecies(id: number) {
        return this.http.get<any>(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    }

    getMove(name:string): Observable<any> {
        return this.http.get<any>(`https://pokeapi.co/api/v2/move/${name}`);
    }
}
