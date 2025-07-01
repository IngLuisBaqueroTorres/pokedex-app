

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PokemonDisplay } from '../interfaces/pokemon-display.interface';

@Injectable({
  providedIn: 'root',
})
export class PokeService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private POKEMON_FAVORITES_KEY = 'favorites';

  http = inject(HttpClient);

  private favoritesSubject = new BehaviorSubject<PokemonDisplay[]>(
    this.loadFavoritesFromLocalStorage()
  );
  public favorites$ = this.favoritesSubject.asObservable();

  private pokemonIdToNameMap = new Map<number, string>();

  constructor() {
    this.favoritesSubject.getValue().forEach((fav) => {
      this.pokemonIdToNameMap.set(fav.id, fav.name);
    });
  }

  getPokemonList(offset = 0, limit = 20): Observable<any> {
    return this.http.get(this.apiUrl + '?offset=' + offset + '&limit=' + limit);
  }

  getPokemonDetails(name: string): Observable<any> {
    return this.http.get(this.apiUrl + '/' + name).pipe(
      tap((details: any) => {
        this.pokemonIdToNameMap.set(details.id, details.name);
      })
    );
  }

  getPokemonDetailsById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + '/' + id).pipe(
      tap((details: any) => {
        this.pokemonIdToNameMap.set(details.id, details.name);
      })
    );
  }

  private loadFavoritesFromLocalStorage(): PokemonDisplay[] {
    const favs = localStorage.getItem(this.POKEMON_FAVORITES_KEY);
    return favs ? JSON.parse(favs) : [];
  }

  private saveFavoritesToLocalStorage(favs: PokemonDisplay[]): void {
    localStorage.setItem(this.POKEMON_FAVORITES_KEY, JSON.stringify(favs));
  }

  toggleFavorite(pokemon: PokemonDisplay): void {
    const currentFavs = this.favoritesSubject.getValue();
    const isCurrentlyFavorite = currentFavs.some(
      (fav) => fav.id === pokemon.id
    );

    let updatedFavs: PokemonDisplay[];

    if (isCurrentlyFavorite) {
      updatedFavs = currentFavs.filter((fav) => fav.id !== pokemon.id);
      console.log(`Removed ${pokemon.name} from favorites.`);
    } else {
      updatedFavs = [...currentFavs, pokemon];

      this.pokemonIdToNameMap.set(pokemon.id, pokemon.name);
      console.log(`Added ${pokemon.name} to favorites.`);
    }

    this.favoritesSubject.next(updatedFavs);
    this.saveFavoritesToLocalStorage(updatedFavs);
  }

  isFavorite(pokemonId: number): Observable<boolean> {
    return this.favorites$.pipe(
      map((favs) => favs.some((fav) => fav.id === pokemonId))
    );
  }

  getFavorites(): PokemonDisplay[] {
    return this.favoritesSubject.getValue();
  }

  getPokemonNameById(id: number): string | undefined {
    return this.pokemonIdToNameMap.get(id);
  }
}
