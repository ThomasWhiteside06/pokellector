import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../services/pokemon';
import { PokemonListItem, PokemonForm } from '../models/pokemon-list';
import { NavBar } from '../nav-bar/nav-bar';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-pokemon-details',
  standalone: true,
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css',
  imports: [NavBar]
})
export class PokemonDetails implements OnInit {
  pokemon: any | null = null;
  pokemonDetails: PokemonListItem | null = null;
  selectedForm: PokemonForm | null = null;
  pokemonList: PokemonListItem[] = [];
  formPokemon: any;
  speciesData: any | null = null;
  moveDetails: any[] = [];
  moveGroups = {
    levelUp: [] as any[],
    tm: [] as any[],
    tutor: [] as any[],
    egg: [] as any[],
    evolution: [] as any[]
};

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const name = params.get('name');
      if (!name) return;
      this.pokemon = null;
      this.pokemonDetails = null;
      forkJoin({pokemon: this.pokemonService.getPokemon(name), list: this.pokemonService.getPokemonListItems()}).subscribe(({ pokemon, list }) => {
        this.pokemon = pokemon;
        this.pokemonList = list;
        this.pokemonService.getPokemonSpecies(pokemon.id).subscribe(species => {console.log("Species data:", species);this.speciesData = species;});
        const species = list.find(p => p.name === name || p.forms.some(f => f.name === name));
        this.pokemonDetails = species ?? null;
        if (species) {this.selectedForm = species.forms.find(f => f.name === name) ?? species.forms.find(f => f.isDefault) ?? null;}
        if (this.selectedForm) {
            this.loadFormDetails(this.selectedForm);
        }
        this.cdr.detectChanges();
      });
    });
  }

  onSearch(search: string) {
    console.log(search);
  }

  formatPokemonName(): string {
    if (!this.pokemonDetails) {return '';}
    if (!this.selectedForm || this.selectedForm.name === this.pokemonDetails.name) {return this.capitalize(this.pokemonDetails.name);}
    const formName = this.selectedForm.formName || this.selectedForm.name;
    return `${this.capitalize(formName)} ${this.capitalize(this.pokemonDetails.name)}`;
  }
    capitalize(value: string): string {return value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}

  formatFormName(name: string): string {
    return name
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
  }

  selectForm(form: PokemonForm) {
    console.log("Selecting:", form.name, form.pokemonId);
    this.selectedForm = form;
    this.formPokemon = null;
    this.loadFormDetails(form);
  }

  loadFormDetails(form: PokemonForm) {

    console.log("Requesting:", form.pokemonId);

    this.pokemonService.getPokemon(form.pokemonId.toString())
        .subscribe(data => {

            console.log("Received:", data.id, data.name);

            this.formPokemon = data;

            console.log(
                "NUMBER OF MOVES:",
                this.formPokemon.moves?.length
            );

            this.loadMoveDetails();

            this.cdr.detectChanges();

        });

    }

  getFlavorText(): string {
    if (!this.speciesData) {return '';}
    const entry = this.speciesData.flavor_text_entries.find((entry: any) => entry.language.name === 'en');
    return entry ? entry.flavor_text.replace(/\n|\f/g, ' ') : '';
  }

  getSpriteGenerations(): string[] {
    if (!this.formPokemon?.sprites?.versions) return [];

    const generationOrder = [
        'generation-i',
        'generation-ii',
        'generation-iii',
        'generation-iv',
        'generation-v',
        'generation-vi',
        'generation-vii',
        'generation-viii',
        'generation-ix'
    ];

    return generationOrder.filter(gen =>
        this.formPokemon.sprites.versions[gen]
    );
  }


  getSpriteGames(generation:string): string[] {
    const gameOrder:any = {
        'generation-i': [
            'red-blue',
            'yellow'
        ],

        'generation-ii': [
            'gold',
            'silver',
            'crystal'
        ],

        'generation-iii': [
            'ruby-sapphire',
            'emerald',
            'firered-leafgreen'
        ],

        'generation-iv': [
            'diamond-pearl',
            'platinum',
            'heartgold-soulsilver'
        ],

        'generation-v': [
            'black-white'
        ],

        'generation-vi': [
            'omegaruby-alphasapphire',
            'x-y'
        ],

        'generation-vii': [
            'ultra-sun-ultra-moon',
            'icons'
        ],

        'generation-viii': [
            'sword-shield',
            'icons'
        ],

        'generation-ix': [
            'scarlet-violet'
        ]

    };


    const available =
        Object.keys(
            this.formPokemon.sprites.versions[generation]
        );
    if(gameOrder[generation]) {
        return gameOrder[generation]
            .filter((game:string)=>
                available.includes(game)
            );
    }
    return available;
  }


  getSpriteList(generation:string, game:string) {

    const sprites =
        this.formPokemon
            ?.sprites
            ?.versions[generation]?.[game];


    if(!sprites) return [];


    const allowedSprites = [
        'front_default',
        'back_default',
        'front_shiny',
        'back_shiny',
        'front_female',
        'back_female',
        'front_shiny_female',
        'back_shiny_female'
    ];


    const seen = new Set<string>();


    return allowedSprites
        .filter(key => sprites[key])
        .filter(key => {

            const url = sprites[key];

            if(seen.has(url)) {
                return false;
            }

            seen.add(url);
            return true;

        })
        .map(key => ({
            name:key,
            url:sprites[key]
        }));

}

  formatSpriteName(name:string):string {

    const labels:any = {

        front_default: "Front",
        back_default: "Back",

        front_shiny: "Shiny Front",
        back_shiny: "Shiny Back",

        front_female: "Female Front",
        back_female: "Female Back",

        front_shiny_female: "Female Shiny Front",
        back_shiny_female: "Female Shiny Back"

    };


    return labels[name] ?? 
        name
        .replace(/_/g,' ')
        .replace(/\b\w/g,char => char.toUpperCase());

  }

  getModernSprites() {
    if (!this.formPokemon?.sprites?.other) {
        return [];
    }

    const sprites = this.formPokemon.sprites.other;

    const results:any[] = [];

    if (sprites.home) {
        if (sprites.home.front_default) {
            results.push({
                name: "Pokémon HOME",
                url: sprites.home.front_default
            });
        }

        if (sprites.home.front_shiny) {
            results.push({
                name: "Pokémon HOME Shiny",
                url: sprites.home.front_shiny
            });
        }

        if (sprites.home.front_female) {
            results.push({
                name: "Pokémon HOME Female",
                url: sprites.home.front_female
            });
        }

        if (sprites.home.front_shiny_female) {
            results.push({
                name: "Pokémon HOME Female Shiny",
                url: sprites.home.front_shiny_female
            });
        }
    }


    if (sprites.showdown) {

        if (sprites.showdown.front_default) {
            results.push({
                name:"Animated",
                url:sprites.showdown.front_default
            });
        }

        if (sprites.showdown.front_shiny) {
            results.push({
                name:"Animated Shiny",
                url:sprites.showdown.front_shiny
            });
        }

    }


    if (sprites['official-artwork']) {

        if (sprites['official-artwork'].front_default) {
            results.push({
                name:"Official Artwork",
                url:sprites['official-artwork'].front_default
            });
        }

        if (sprites['official-artwork'].front_shiny) {
            results.push({
                name:"Official Artwork Shiny",
                url:sprites['official-artwork'].front_shiny
            });
        }

    }


    return results;
  }

  getModernSpritesByGame(game: string) {

    if (!this.formPokemon?.sprites) {
        return [];
    }

    const sprites = this.formPokemon.sprites;

    const modernSprites: any[] = [];


    if (game === 'pokemon-home') {

        if (sprites.other?.home?.front_default) {
        modernSprites.push({
            name: 'Home',
            url: sprites.other.home.front_default
        });
        }

        if (sprites.other?.home?.front_shiny) {
        modernSprites.push({
            name: 'Home Shiny',
            url: sprites.other.home.front_shiny
        });
        }

    }


    if (game === 'scarlet-violet') {

        const sv = sprites.versions?.['generation-ix']?.['scarlet-violet'];

        if (sv?.front_default) {
        modernSprites.push({
            name: 'Scarlet Violet',
            url: sv.front_default
        });
        }

        if (sv?.front_shiny) {
        modernSprites.push({
            name: 'Scarlet Violet Shiny',
            url: sv.front_shiny
        });
        }

    }


    if (game === 'sword-shield') {

        const swsh = sprites.versions?.['generation-viii']?.['icons'];

        if (swsh?.front_default) {
        modernSprites.push({
            name: 'Sword Shield Icon',
            url: swsh.front_default
        });
        }

    }


    return modernSprites;

    }

    loadMoveDetails() {

    if (!this.formPokemon?.moves) {
        return;
    }

    const requests: Observable<any>[] = this.formPokemon.moves.map((move: any) =>
    this.pokemonService.getMove(move.move.name)
);


    forkJoin(requests).subscribe((moves:any[]) => {


        const allMoves = moves.map((move:any,index:number)=> {

            const methods =
                this.formPokemon.moves[index]
                .version_group_details;


            return {
    id: move.id,
    name: move.name,
    type: move.type.name,
    damageClass: move.damage_class.name,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,

    effect:
        move.effect_entries?.find(
            (e:any)=>e.language.name === 'en'
        )?.short_effect ?? '',

    methods,

    level:
        methods.find(
            (m:any) => m.move_learn_method.name === 'level-up'
        )?.level_learned_at ?? null
};

        });


        this.moveGroups = {

    levelUp: allMoves
        .filter(m =>
            m.methods.some(
                (x:any)=>x.move_learn_method.name === 'level-up'
            )
        ).map(m => ({
        ...m,
        level:
            Math.min(
                ...m.methods
                    .filter((x:any) => x.move_learn_method.name === 'level-up')
                    .map((x:any) => x.level_learned_at)
                    .filter((level:any) => level > 0)
            )
    }))
    .sort((a,b) => a.level - b.level),

    tm: allMoves.filter(m =>
        m.methods.some(
            (x:any)=>x.move_learn_method.name === 'machine'
        )
    ),

    tutor: allMoves.filter(m =>
        m.methods.some(
            (x:any)=>x.move_learn_method.name === 'tutor'
        )
    ),

    egg: allMoves.filter(m =>
        m.methods.some(
            (x:any)=>x.move_learn_method.name === 'egg'
        )
    ),

    evolution: []

};


        console.log("MOVE GROUPS",this.moveGroups);


        this.cdr.detectChanges();

    });

}



getLevel(move:any):number {

    const level = move.methods.find(
        (m:any)=>m.move_learn_method.name === 'level-up'
    )?.level_learned_at;

    return level ?? 999;

}

    groupMoves() {
        this.moveGroups = {
            levelUp: [],
            tm: [],
            tutor: [],
            egg: [],
            evolution: []
        };


        this.moveDetails.forEach(move => {


            move.methods.forEach((method:any) => {


                const entry = {

                    ...move,

                    level: method.level_learned_at,

                    method: method.move_learn_method.name

                };


                console.log(
                    move.name,
                    method.move_learn_method.name,
                    method.level_learned_at
                );


                switch(method.move_learn_method.name) {


                    case 'level-up':

                        this.moveGroups.levelUp.push(entry);

                        break;


                    case 'machine':

                        this.moveGroups.tm.push(entry);

                        break;


                    case 'tutor':

                        this.moveGroups.tutor.push(entry);

                        break;


                    case 'egg':

                        this.moveGroups.egg.push(entry);

                        break;


                    default:

                        this.moveGroups.tutor.push(entry);

                        break;

                }


            });


        });


        this.moveGroups.levelUp.sort(
            (a,b) => a.level - b.level
        );


        console.log("MOVE GROUPS", this.moveGroups);

    }
    
    getMoveTypeColour(type:string){

    const colours:any = {

        normal:'#A8A77A',
        fire:'#EE8130',
        water:'#6390F0',
        electric:'#F7D02C',
        grass:'#7AC74C',
        ice:'#96D9D6',
        fighting:'#C22E28',
        poison:'#A33EA1',
        ground:'#E2BF65',
        flying:'#A98FF3',
        psychic:'#F95587',
        bug:'#A6B91A',
        rock:'#B6A136',
        ghost:'#735797',
        dragon:'#6F35FC',
        dark:'#705746',
        steel:'#B7B7CE',
        fairy:'#D685AD'

    };

    return colours[type] ?? '#ddd';

}
}