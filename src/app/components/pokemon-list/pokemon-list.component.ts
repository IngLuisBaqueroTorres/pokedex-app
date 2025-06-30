import { Component, OnInit, signal } from '@angular/core';
import { PokeService } from '../../services/poke.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
})
export class PokemonListComponent implements OnInit {
  pokemonList = signal<any[]>([]);
  searchQuery = '';

  constructor(protected pokeService: PokeService) {}

  ngOnInit(): void {
    this.loadPokemon();
  }

  protected getRouterLink(name: string): string {
    return `/pokemon/${name}`;
  }

  loadPokemon(): void {
    this.pokeService.getPokemonList().subscribe({
      next: (data) => {
        this.pokemonList.set([...this.pokemonList(), ...data.results]);
      },
      error: (err) => console.error('Failed to load Pokémon', err),
    });
  }

  public getFavs() {
    const favs = localStorage.getItem('favs');
    if (!favs) return [];
    return JSON.parse(favs);
  }

  searchPokemon(): void {
    if (this.searchQuery.trim()) {
      this.pokeService
        .getPokemonDetails(this.searchQuery.toLowerCase())
        .subscribe({
          next: (pokemon) => {
            this.pokemonList.set([pokemon]);
          },
          error: (err) => console.error('Failed to search Pokémon', err),
        });
    }
  }
}
