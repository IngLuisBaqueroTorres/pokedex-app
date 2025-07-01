import {
  Component,
  OnInit,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { PokeService } from '../../services/poke.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  forkJoin,
  map,
  switchMap,
  catchError,
  of,
  Observable,
  finalize,
} from 'rxjs';

import { PokemonDetailModalComponent } from '../pokemon-detail-modal/pokemon-detail-modal.component';

import { PokemonDisplay } from '../../interfaces/pokemon-display.interface';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PokemonDetailModalComponent,
  ],
  standalone: true,
})
export class PokemonListComponent implements OnInit {
  allLoadedPokemon = signal<PokemonDisplay[]>([]);
  searchQuery = '';
  isLoading = signal(true);
  isLoadingMore = signal(false);

  loadedPagesCount = 0;
  itemsPerPage = 20;
  totalPokemonCount = signal(0);
  isShowingFavorites = signal(false);

  currentViewPage = signal(1);

  selectedPokemonForModal = signal<PokemonDisplay | null>(null);
  isModalOpen = signal(false);

  displayedPokemonList = computed(() => {
    if (this.isShowingFavorites() || this.searchQuery.length > 0) {
      return this.allLoadedPokemon();
    }

    const startIndex = (this.currentViewPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allLoadedPokemon().slice(startIndex, endIndex);
  });

  pokemonTypeColors: { [key: string]: string } = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    grass: '#7AC74C',
    electric: '#F7D02C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    steel: '#B7B7CE',
    dark: '#705746',
    fairy: '#D685AD',
    unknown: '#68A090',
    shadow: '#444444',
  };

  @ViewChild('pokemonGridContainer') pokemonGridContainer!: ElementRef;
  private scrollPosition: number = 0;
  private shouldMaintainScroll: boolean = false;

  constructor(protected pokeService: PokeService) {}

  ngOnInit(): void {
    this.loadPokemonsChunk(0, true);
  }

  protected getRouterLink(name: string): string {
    return `/pokemon/${name}`;
  }

  private getPokemonDetailsWithImage(pokemon: any): Observable<PokemonDisplay> {
    return this.pokeService.getPokemonDetails(pokemon.name).pipe(
      map((details) => {


        return {
          name: details.name,
          url: details.url,
          imageUrl:
            details.sprites.other['official-artwork']?.front_default ||
            details.sprites.front_default,
          id: details.id,
          types: details.types,
          abilities: details.abilities,
          weight: details.weight,
          height: details.height,
        } as PokemonDisplay;
      }),
      catchError((err) => {
        console.warn(`Failed to load details for ${pokemon.name}:`, err);
        const extractedId = this.extractIdFromUrl(pokemon.url);

        const idToUse = extractedId !== undefined ? extractedId : 0;

        return of({
          name: pokemon.name,
          url: pokemon.url,
          imageUrl: null,
          id: idToUse,
          types: [],
          abilities: [],
          weight: 0,
          height: 0,
        } as PokemonDisplay);
      })
    );
  }

  private extractIdFromUrl(url: string): number | undefined {
    const parts = url.split('/');
    const id = parseInt(parts[parts.length - 2], 10);
    return isNaN(id) ? undefined : id;
  }

  loadPokemonsChunk(offset: number, append: boolean): void {
    if (!append) {
      this.isLoading.set(true);
    } else {
      this.isLoadingMore.set(true);
    }

    if (this.shouldMaintainScroll && this.pokemonGridContainer) {
      this.scrollPosition = window.scrollY;
    }

    this.pokeService
      .getPokemonList(offset, this.itemsPerPage)
      .pipe(
        switchMap((initialData) => {
          this.totalPokemonCount.set(initialData.count);

          const detailRequests: Observable<PokemonDisplay>[] =
            initialData.results.map((pokemon: any) =>
              this.getPokemonDetailsWithImage(pokemon)
            );
          return forkJoin(detailRequests).pipe(
            catchError((err): Observable<PokemonDisplay[]> => {
              console.error('Failed to load Pokémon details:', err);
              return of([]);
            })
          );
        }),
        catchError((err): Observable<PokemonDisplay[]> => {
          console.error('Failed to load Pokémon list chunk:', err);
          return of([]);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);

          if (this.shouldMaintainScroll && this.scrollPosition > 0) {
            requestAnimationFrame(() => {
              window.scrollTo({
                top: this.scrollPosition,
                behavior: 'instant',
              });
              this.scrollPosition = 0;
            });
          }
          this.shouldMaintainScroll = false;
        })
      )
      .subscribe({
        next: (detailedPokemons: PokemonDisplay[]) => {
          if (append) {
            this.allLoadedPokemon.update((currentList) => [
              ...currentList,
              ...detailedPokemons,
            ]);
          } else {
            this.allLoadedPokemon.set(detailedPokemons);
            this.resetScrollToTop();
          }
        },
        error: (err) => {
          console.error(
            'Failed to process Pokémon list chunk with images',
            err
          );
        },
      });
  }

  loadPokemon(): void {
    this.loadedPagesCount = 0;
    this.currentViewPage.set(1);
    this.allLoadedPokemon.set([]);
    this.isShowingFavorites.set(false);
    this.searchQuery = '';
    this.shouldMaintainScroll = false;

    this.loadPokemonsChunk(0, true);
  }

  loadMorePokemon(): void {
    const currentLoadedItems = (this.loadedPagesCount + 1) * this.itemsPerPage;
    if (
      !this.searchQuery.trim() &&
      !this.isShowingFavorites() &&
      currentLoadedItems < this.totalPokemonCount() &&
      !this.isLoadingMore()
    ) {
      this.shouldMaintainScroll = true;
      const nextOffset = (this.loadedPagesCount + 1) * this.itemsPerPage;
      this.loadPokemonsChunk(nextOffset, true);
      this.loadedPagesCount++;
    }
  }

  goToPage(pageNumber: number): void {
    if (this.isShowingFavorites() || this.searchQuery.length > 0) {
      this.loadPokemon();
      return;
    }

    const maxPageLoaded = Math.ceil(
      this.allLoadedPokemon().length / this.itemsPerPage
    );
    if (pageNumber >= 1 && pageNumber <= maxPageLoaded) {
      this.shouldMaintainScroll = true;
      this.currentViewPage.set(pageNumber);

      requestAnimationFrame(() => {
        window.scrollTo({ top: this.scrollPosition, behavior: 'instant' });
        this.shouldMaintainScroll = false;
        this.scrollPosition = 0;
      });
    }
  }

  getPaginationPages(): number[] {
    if (
      this.isLoading() ||
      this.allLoadedPokemon().length === 0 ||
      this.isShowingFavorites() ||
      this.searchQuery.length > 0
    ) {
      return [];
    }

    const pagesToShow = Math.ceil(
      this.allLoadedPokemon().length / this.itemsPerPage
    );

    if (pagesToShow === 0 && this.allLoadedPokemon().length > 0) return [1];

    return Array.from({ length: pagesToShow }, (_, i) => i + 1);
  }

  searchPokemon(): void {
    if (this.searchQuery.trim()) {
      this.isLoading.set(true);
      this.isShowingFavorites.set(false);
      this.totalPokemonCount.set(0);
      this.shouldMaintainScroll = false;

      this.pokeService
        .getPokemonDetails(this.searchQuery.toLowerCase())
        .pipe(
          map(
            (pokemon) =>
              ({
                name: pokemon.name,
                url: pokemon.url,
                imageUrl:
                  pokemon.sprites.other['official-artwork']?.front_default ||
                  pokemon.sprites.front_default,
                id: pokemon.id,
                types: pokemon.types,
                abilities: pokemon.abilities,
                weight: pokemon.weight,
                height: pokemon.height,
              } as PokemonDisplay)
          ),
          catchError((err) => {
            console.error('Failed to search Pokémon', err);
            return of(null);
          }),
          finalize(() => {
            this.isLoading.set(false);
            this.resetScrollToTop();
          })
        )
        .subscribe({
          next: (pokemon: PokemonDisplay | null) => {

            if (pokemon) {
              this.allLoadedPokemon.set([pokemon]);
            } else {
              this.allLoadedPokemon.set([]);
            }
          },
          error: (err) => {

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

      return JSON.parse(favs).map((fav: any) =>
        typeof fav.id === 'number' ? fav.id : 0
      );
    } catch (e) {
      console.error('Error parsing favs from localStorage', e);
      return [];
    }
  }

  getPokemonNameFromId(id: number): string | undefined {
    const pokemon = this.allLoadedPokemon().find((p) => p.id === id);
    return pokemon ? pokemon.name : `ID: ${id}`;
  }

  showFavorites(): void {
    this.isLoading.set(true);
    this.isShowingFavorites.set(true);
    this.totalPokemonCount.set(0);
    this.shouldMaintainScroll = false;

    const favoriteIds = this.getFavs();

    if (favoriteIds.length === 0) {
      this.allLoadedPokemon.set([]);
      this.isLoading.set(false);
      this.resetScrollToTop();
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
                  details.sprites.other['official-artwork']?.front_default ||
                  details.sprites.front_default,
                id: details.id,
                types: details.types,
                abilities: details.abilities,
                weight: details.weight,
                height: details.height,
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
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.resetScrollToTop();
        })
      )
      .subscribe({
        next: (favoritePokemons: PokemonDisplay[]) => {
          this.allLoadedPokemon.set(favoritePokemons);
        },
        error: (err) => {
          console.error(
            'Failed to process favorite Pokémon list with images',
            err
          );
        },
      });
  }

  getCardBackgroundColor(pokemon: PokemonDisplay): string {
    if (!pokemon.types || pokemon.types.length === 0) {
      return this.pokemonTypeColors['normal'];
    }

    const primaryType = pokemon.types[0].type.name.toLowerCase();
    const secondaryType =
      pokemon.types.length > 1
        ? pokemon.types[1].type.name.toLowerCase()
        : null;

    if (
      primaryType === 'normal' &&
      secondaryType &&
      this.pokemonTypeColors[secondaryType]
    ) {
      return this.pokemonTypeColors[secondaryType];
    }

    return (
      this.pokemonTypeColors[primaryType] || this.pokemonTypeColors['unknown']
    );
  }

  private resetScrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  openPokemonModal(pokemon: PokemonDisplay): void {
    this.selectedPokemonForModal.set(pokemon);
    this.isModalOpen.set(true);

    document.body.style.overflow = 'hidden';
  }

  closePokemonModal(): void {
    this.isModalOpen.set(false);
    this.selectedPokemonForModal.set(null);

    document.body.style.overflow = '';
  }
}
