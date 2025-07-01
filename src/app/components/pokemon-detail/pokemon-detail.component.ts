import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PokeService } from '../../services/poke.service';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap, catchError, map, filter } from 'rxjs/operators';


import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities.component';


export interface PokemonDisplay {
  name: string;
  url: string;
  imageUrl: string | null;
  id: number;
  types?: { slot: number; type: { name: string; url: string } }[];
  abilities?: {
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }[];
  weight?: number;
  height?: number;
}

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PokemonAbilitiesComponent],
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.css'],
})
export class PokemonDetailComponent implements OnInit, OnDestroy {

  @Input() pokemon: PokemonDisplay | null = null;

  isLoading = true;
  pokemonName: string | null = null;

  isPokemonFavorite$: Observable<boolean> = of(false);
  private pokemonSubscription: Subscription | undefined;

  pokemonTypeColors: { [key: string]: string } = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    grass: '#7AC74C',
    electric: '#F7D02C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    steel: '#B7B7CE',
    dark: '#705746',
    fairy: '#D685AD',
    unknown: '#68A090',
    shadow: '#444444',
  };

  constructor(
    private route: ActivatedRoute,
    private pokeService: PokeService
  ) {}

  ngOnInit(): void {
    if (this.pokemon) {
      this.isLoading = false;
      this.initializeFavoriteStatus(this.pokemon);
    } else {
      this.pokemonSubscription = this.route.paramMap
        .pipe(
          map((params) => params.get('name')),
          filter((name) => !!name),
          switchMap((name) => {
            this.pokemonName = name;
            this.isLoading = true;
            return this.pokeService.getPokemonDetails(name!).pipe(
              catchError((error) => {
                console.error(
                  'Error fetching Pokémon details from route:',
                  error
                );
                this.isLoading = false;
                return of(null);
              })
            );
          })
        )
        .subscribe((pokemon) => {
          this.pokemon = pokemon;
          this.isLoading = false;
          if (this.pokemon) {
            this.initializeFavoriteStatus(this.pokemon);
          } else {
            this.isPokemonFavorite$ = of(false);
          }
        });
    }
  }

  ngOnDestroy(): void {
    if (this.pokemonSubscription) {
      this.pokemonSubscription.unsubscribe();
    }
  }

  private initializeFavoriteStatus(pokemon: PokemonDisplay): void {
    this.isPokemonFavorite$ = this.pokeService.isFavorite(pokemon.id);
  }

  getCardBackgroundColor(): string {
    if (
      !this.pokemon ||
      !this.pokemon.types ||
      this.pokemon.types.length === 0
    ) {
      return this.pokemonTypeColors['normal'];
    }
    const primaryType = this.pokemon.types[0].type.name.toLowerCase();
    const secondaryType =
      this.pokemon.types.length > 1
        ? this.pokemon.types[1].type.name.toLowerCase()
        : null;

    if (
      primaryType === 'normal' &&
      secondaryType &&
      this.pokemonTypeColors[secondaryType]
    ) {
      return this.pokemonTypeColors[secondaryType];
    }

    return (
      this.pokemonTypeColors[primaryType] || this.pokemonTypeColors['unknown']
    );
  }

  toggleFavorite(): void {
    if (!this.pokemon) {
      console.warn('No Pokémon loaded to toggle favorite status.');
      return;
    }
    this.pokeService.toggleFavorite(this.pokemon);
  }
}
