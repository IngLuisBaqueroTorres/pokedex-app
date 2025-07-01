import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // 'of' is not strictly needed here if you don't use it, but can stay.
import { catchError } from 'rxjs/operators'; // 'catchError' is not strictly needed here if you don't use it, but can stay.

@Injectable({
  providedIn: 'root',
})
export class PokeService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  http = inject(HttpClient);

  // Fetches a list of Pokémon with pagination
  getPokemonList(offset = 0, limit = 20): Observable<any> {
    return this.http.get(this.apiUrl + '?offset=' + offset + '&limit=' + limit);
  }

  // Fetches details for a single Pokémon by its name
  getPokemonDetails(name: string): Observable<any> {
    return this.http.get(this.apiUrl + '/' + name);
  }

  // **NEW METHOD: Fetches details for a single Pokémon by its ID**
  // This is the method that was missing and caused the error in your component.
  getPokemonDetailsById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + '/' + id);
  }

  // Saves a Pokémon to local storage favorites
  saveFavorite(pokemon: any): void {
    let favs = localStorage.getItem('favorites');
    let favorites: any[] = JSON.parse(favs || '[]');

    // Prevents adding the same Pokémon multiple times to favorites
    const exists = favorites.some((fav) => fav.id === pokemon.id);
    if (!exists) {
      favorites.push(pokemon);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } else {
      console.log(`Pokémon ${pokemon.name} is already in favorites.`);
    }
  }

  // **NEW METHOD: Retrieves all favorite Pokémon from local storage**
  getFavorites(): any[] {
    const favs = localStorage.getItem('favorites');
    return JSON.parse(favs || '[]');
  }

  // **NEW METHOD: Removes a Pokémon from favorites by its ID**
  removeFavorite(pokemonId: number): void {
    let favs = localStorage.getItem('favorites');
    let favorites: any[] = JSON.parse(favs || '[]');
    const updatedFavorites = favorites.filter((fav) => fav.id !== pokemonId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  }

  // **NEW METHOD: Checks if a Pokémon is currently a favorite**
  isFavorite(pokemonId: number): boolean {
    const favs = localStorage.getItem('favorites');
    const favorites: any[] = JSON.parse(favs || '[]');
    return favorites.some((fav) => fav.id === pokemonId);
  }
}
