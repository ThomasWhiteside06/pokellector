import { Routes } from '@angular/router';
import { Home } from './home/home';
import { PokemonDetails } from './pokemon-details/pokemon-details';
import { Collections } from './collections/collections';
import { CollectionSettings } from './collection-settings/collection-settings';
import { CollectionDetails } from './collection-details/collection-details';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'pokemon/:name', component: PokemonDetails }, 
  { path:'collections', component:Collections},
  { path:'collection-settings', component:CollectionSettings},
  { path: 'collections/:id', component: CollectionDetails },
];