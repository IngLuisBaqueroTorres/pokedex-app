import { Component, OnInit, signal } from '@angular/core';
import { PokeService } from '../../services/poke.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, map, switchMap, catchError, of, Observable } from 'rxjs';


interface PokemonDisplay {
  name: string;
  url: string;
  imageUrl: string | null;
  id?: number;
}

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
})
export class PokemonListComponent implements OnInit {
  pokemonList = signal<PokemonDisplay[]>([]);
  searchQuery = '';
  isLoading = signal(true);
  currentPage = 0;
  isShowingFavorites = signal(false);

  constructor(protected pokeService: PokeService) {}

  ngOnInit(): void {
    this.loadPokemon();
  }

  protected getRouterLink(name: string): string {
    return `/pokemon/${name}`;
  }

  private getPokemonDetailsWithImage(pokemon: any): Observable<PokemonDisplay> {
    return this.pokeService.getPokemonDetails(pokemon.name).pipe(
      map((details) => ({
        name: details.name,
        url: details.url,
        imageUrl:
          details.sprites.other['official-artwork'].front_default ||
          details.sprites.front_default,
        id: details.id,
      })),
      catchError((err) => {
        console.warn(`Failed to load details for ${pokemon.name}:`, err);
        return of({
          name: pokemon.name,
          url: pokemon.url,
          imageUrl: null,
          id: this.extractIdFromUrl(pokemon.url),
        });
      })
    );
  }

  private extractIdFromUrl(url: string): number | undefined {
    const parts = url.split('/');
    const id = parseInt(parts[parts.length - 2], 10);
    return isNaN(id) ? undefined : id;
  }

  loadPokemon(append: boolean = false): void {
    this.isLoading.set(true);
    this.isShowingFavorites.set(false);

    if (!append) {
      this.pokemonList.set([]);
      this.currentPage = 0;
    }

    const offset = this.currentPage * 20;

    this.pokeService
      .getPokemonList(offset, 20)
      .pipe(
        switchMap((initialData) => {
          const detailRequests: Observable<PokemonDisplay>[] =
            initialData.results.map((pokemon: any) =>
              this.getPokemonDetailsWithImage(pokemon)
            );
          return forkJoin(detailRequests).pipe(
            catchError((err): Observable<PokemonDisplay[]> => {
              console.error('Failed to load initial Pokémon details:', err);
              return of([]);
            })
          );
        }),
        catchError((err): Observable<PokemonDisplay[]> => {
          console.error('Failed to load initial Pokémon list:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (detailedPokemons: PokemonDisplay[]) => {
          if (append) {
            this.pokemonList.update((currentList) => [
              ...currentList,
              ...detailedPokemons,
            ]);
          } else {
            this.pokemonList.set(detailedPokemons);
          }
          this.isLoading.set(false);
          this.currentPage++;
        },
        error: (err) => {
          this.isLoading.set(false);
        },
      });
  }

  loadMorePokemon(): void {
    if (!this.searchQuery.trim() && !this.isShowingFavorites()) {
      this.loadPokemon(true);
    }
  }

  searchPokemon(): void {
    if (this.searchQuery.trim()) {
      this.isLoading.set(true);
      this.isShowingFavorites.set(false);

      this.pokeService
        .getPokemonDetails(this.searchQuery.toLowerCase())
        .pipe(
          map(
            (pokemon) =>
              ({
                name: pokemon.name,
                url: pokemon.url,
                imageUrl:
                  pokemon.sprites.other['official-artwork'].front_default ||
                  pokemon.sprites.front_default,
                id: pokemon.id,
              } as PokemonDisplay)
          ),
          catchError((err) => {
            console.error('Failed to search Pokémon', err);
            return of(null);
          })
        )
        .subscribe({
          next: (pokemon) => {
            if (pokemon) {
              this.pokemonList.set([pokemon]);
            } else {
              this.pokemonList.set([]);
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
          },
        });
    } else {
      this.loadPokemon();
    }
  }

  public getFavs(): number[] {
    const favs = localStorage.getItem('favorites');
    if (!favs) return [];
    try {
      return JSON.parse(favs).map((fav: any) => fav.id);
    } catch (e) {
      console.error('Error parsing favs from localStorage', e);
      return [];
    }
  }

  getPokemonNameFromId(id: number): string | undefined {
    const pokemon = this.pokemonList().find((p) => p.id === id);
    return pokemon ? pokemon.name : `ID: ${id}`;
  }

  showFavorites(): void {
    this.isLoading.set(true);
    this.isShowingFavorites.set(true);
    this.pokemonList.set([]);

    const favoriteIds = this.getFavs();

    if (favoriteIds.length === 0) {
      this.pokemonList.set([]);
      this.isLoading.set(false);
      return;
    }

    const favoriteRequests: Observable<PokemonDisplay | null>[] =
      favoriteIds.map((id) =>
        this.pokeService.getPokemonDetailsById(id).pipe(
          map(
            (details) =>
              ({
                name: details.name,
                url: details.url,
                imageUrl:
                  details.sprites.other['official-artwork'].front_default ||
                  details.sprites.front_default,
                id: details.id,
              } as PokemonDisplay)
          ),
          catchError((err) => {
            console.warn(`Failed to load favorite Pokémon with ID ${id}:`, err);
            return of(null);
          })
        )
      );

    forkJoin(favoriteRequests)
      .pipe(
        map(
          (pokemons: (PokemonDisplay | null)[]) =>
            pokemons.filter((p) => p !== null) as PokemonDisplay[]
        ),
        catchError((err): Observable<PokemonDisplay[]> => {
          console.error('Failed to load favorite Pokémon list:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (favoritePokemons: PokemonDisplay[]) => {
          this.pokemonList.set(favoritePokemons);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(
            'Failed to process favorite Pokémon list with images',
            err
          );
          this.isLoading.set(false);
        },
      });
  }
}
