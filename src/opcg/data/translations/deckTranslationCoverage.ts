import type { NormalizedCardData } from "../cardDatabaseTypes";
import { koroLucciLeaderCardId, koroLucciMainDeck } from "../decklists/koroLucciDeck";
import { makotoPeronaLeaderCardId, makotoPeronaMainDeck } from "../decklists/makotoPeronaDeck";
import type { CardTextTranslation } from "./translationTypes";

export const requiredTranslationCardIds = Array.from(
  new Set([
    makotoPeronaLeaderCardId,
    ...makotoPeronaMainDeck.map((entry) => entry.cardId),
    koroLucciLeaderCardId,
    ...koroLucciMainDeck.map((entry) => entry.cardId),
    "DON-don",
  ]),
);

export function getMissingTranslations(
  cardDatabase: Record<string, NormalizedCardData>,
  translations: Record<string, CardTextTranslation>,
  cardIds = requiredTranslationCardIds,
) {
  return cardIds.filter((cardId) => cardDatabase[cardId] && !translations[cardId]);
}
