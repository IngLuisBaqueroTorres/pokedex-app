export interface PokemonDisplay {
  name: string;
  url: string;
  imageUrl: string | null;
  id: number;
  types?: { slot: number; type: { name: string; url: string } }[];
  abilities?: {
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }[];
  weight?: number;
  height?: number;
}
