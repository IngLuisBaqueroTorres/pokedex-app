import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PokemonDisplay } from '../../interfaces/pokemon-display.interface';
@Component({
  selector: 'app-pokemon-abilities',
  standalone: true,
  imports: [TitleCasePipe, CommonModule],
  templateUrl: './pokemon-abilities.component.html',
  styleUrls: ['./pokemon-abilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PokemonAbilitiesComponent {
  @Input() pokemon!: PokemonDisplay;
}
