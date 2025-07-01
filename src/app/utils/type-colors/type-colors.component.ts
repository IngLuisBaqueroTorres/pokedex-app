import { PokemonDisplay } from '../../interfaces/pokemon-display.interface';
export const pokemonTypeColors: { [key: string]: string } = {
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
export function getPokemonTypeBackgroundColor(pokemon: PokemonDisplay): string {
  if (!pokemon.types || pokemon.types.length === 0) {
    return pokemonTypeColors['normal'];
  }

  const primaryType = pokemon.types[0].type.name.toLowerCase();
  const secondaryType =
    pokemon.types.length > 1 ? pokemon.types[1].type.name.toLowerCase() : null;

  if (
    primaryType === 'normal' &&
    secondaryType &&
    pokemonTypeColors[secondaryType]
  ) {
    return pokemonTypeColors[secondaryType];
  }

  return pokemonTypeColors[primaryType] || pokemonTypeColors['unknown'];
}
