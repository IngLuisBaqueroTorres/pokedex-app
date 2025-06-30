import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-pokemon-abilities',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './pokemon-abilities.component.html',
  styleUrl: './pokemon-abilities.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PokemonAbilitiesComponent {
  @Input() abilities: { base_stat: number; stat: { name: string } }[] = [];
}
