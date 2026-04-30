import type { CardType } from "../engine/types";

export type NormalizedCardData = {
  cardId: string;
  name: string;
  type: CardType;
  colors: string[];
  cost?: number;
  power?: number;
  counter?: number;
  life?: number;
  traits: string[];
  effect: string;
  triggerText?: string;
  keywords: string[];
  rarity?: string;
  set?: string;
  imageUrl?: string;
};

export type DeckListEntry = {
  cardId: string;
  count: number;
};
