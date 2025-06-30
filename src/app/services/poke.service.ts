import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PokeService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';

  http = inject(HttpClient);

  getPokemonList(offset = 0, limit = 20): Observable<any> {
    return this.http.get(this.apiUrl + '?offset=' + offset + '&limit=' + limit);
  }

  getPokemonDetails(name: string): Observable<any> {
    return this.http.get(this.apiUrl + '/' + name);
  }

  saveFavorite(pokemon: any): void {
    let favs = localStorage.getItem('favorites');
    let favorites = JSON.parse(favs || '[]');
    favorites.push(pokemon);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}
