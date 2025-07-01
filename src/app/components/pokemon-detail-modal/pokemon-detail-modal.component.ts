import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PokemonAbilitiesComponent } from '../pokemon-abilities/pokemon-abilities.component';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';

import { PokemonDisplay } from '../../interfaces/pokemon-display.interface';

import { getPokemonTypeBackgroundColor } from '../../utils/type-colors/type-colors.component';

@Component({
  selector: 'app-pokemon-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PokemonAbilitiesComponent,
    PokemonDetailComponent,
  ],
  templateUrl: './pokemon-detail-modal.component.html',
  styleUrls: ['./pokemon-detail-modal.component.scss'],
})
export class PokemonDetailModalComponent {
  @Input() pokemon!: PokemonDisplay | null;
  @Output() closeModal = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }

  getCardBackgroundColor(pokemon: PokemonDisplay): string {
    if (!pokemon) {
      return '#CCCCCC';
    }
    return getPokemonTypeBackgroundColor(pokemon);
  }
}
