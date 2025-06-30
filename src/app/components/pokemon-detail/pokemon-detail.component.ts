import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokeService } from '../../services/poke.service';
import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities.component';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.css'],
  standalone: true,
  imports: [CommonModule, PokemonAbilitiesComponent, TitleCasePipe],
})
export class PokemonDetailComponent implements OnInit {
  pokemon: any;

  constructor(
    private route: ActivatedRoute,
    private pokeService: PokeService
  ) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) return;
    this.pokeService.getPokemonDetails(name).subscribe({
      next: (data) => (this.pokemon = data),
      error: (err) => console.error('Failed to load Pokémon details', err),
    });
  }

  addFavorite(): void {
    this.pokeService.saveFavorite(this.pokemon);
  }
}
