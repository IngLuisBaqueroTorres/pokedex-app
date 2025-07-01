// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { RouterOutlet } from '@angular/router'; // Comenta o elimina
import { PokemonListComponent } from './components/pokemon-list/pokemon-list.component'; // ¡Importa tu PokemonListComponent!

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    // RouterOutlet, // Comenta o elimina
    PokemonListComponent, // ¡Añade tu PokemonListComponent aquí!
  ],
  template: ` <app-pokemon-list></app-pokemon-list> `,
  styles: [],
})
export class AppComponent {}
