import cardsJson from "./generated/cards.json";
import type { NormalizedCardData } from "./cardDatabaseTypes";

export const cardDatabase = Object.fromEntries(
  (cardsJson as NormalizedCardData[]).map((card) => [card.cardId, card]),
) as Record<string, NormalizedCardData>;

export const allCards = cardsJson as NormalizedCardData[];
