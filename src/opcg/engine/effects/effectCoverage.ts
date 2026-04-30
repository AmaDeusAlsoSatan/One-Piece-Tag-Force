import { cardDatabase } from "../../data/cardDatabase";
import type { DeckListEntry, NormalizedCardData } from "../../data/cardDatabaseTypes";
import {
  koroLucciLeaderCardId,
  koroLucciMainDeck,
} from "../../data/decklists/koroLucciDeck";
import {
  makotoPeronaLeaderCardId,
  makotoPeronaMainDeck,
} from "../../data/decklists/makotoPeronaDeck";
import type { CardEffectHandler } from "./effectTypes";
import { effectRegistry } from "./effectRegistry";

const genericKeywords = new Set(["Blocker", "Rush", "Banish", "Double Attack"]);

type CoverageCard = {
  cardId: string;
  name: string;
};

export type DeckEffectCoverage = {
  cardsWithEffect: CoverageCard[];
  cardsWithHandler: CoverageCard[];
  cardsMissingHandler: CoverageCard[];
  cardsWithoutEffect: CoverageCard[];
};

function uniqueDeckCardIds(deckList: DeckListEntry[], leaderCardId: string): string[] {
  return Array.from(new Set([leaderCardId, ...deckList.map((entry) => entry.cardId)]));
}

function cardNeedsHandler(card: NormalizedCardData): boolean {
  const hasText = Boolean(card.effect?.trim() || card.triggerText?.trim());
  const hasNonGenericKeyword = card.keywords.some((keyword) => !genericKeywords.has(keyword));

  return hasText || hasNonGenericKeyword;
}

function toCoverageCard(card: NormalizedCardData): CoverageCard {
  return {
    cardId: card.cardId,
    name: card.name,
  };
}

export function getDeckEffectCoverage(
  deckList: DeckListEntry[],
  leaderCardId: string,
  database: Record<string, NormalizedCardData>,
  registry: Record<string, CardEffectHandler[]>,
): DeckEffectCoverage {
  const cards = uniqueDeckCardIds(deckList, leaderCardId)
    .map((cardId) => database[cardId])
    .filter((card): card is NormalizedCardData => Boolean(card));

  const cardsWithEffect = cards.filter(cardNeedsHandler).map(toCoverageCard);
  const cardsWithHandler = cardsWithEffect.filter((card) => (registry[card.cardId] ?? []).length > 0);
  const cardsMissingHandler = cardsWithEffect.filter((card) => (registry[card.cardId] ?? []).length === 0);
  const cardsWithoutEffect = cards.filter((card) => !cardNeedsHandler(card)).map(toCoverageCard);

  return {
    cardsWithEffect,
    cardsWithHandler,
    cardsMissingHandler,
    cardsWithoutEffect,
  };
}

function formatCoverageLine(card: CoverageCard, covered: boolean): string {
  return `${covered ? "OK" : "MISSING"} ${card.cardId} ${card.name}`;
}

function logDeckCoverage(label: string, coverage: DeckEffectCoverage) {
  console.info(`${label}:`);
  coverage.cardsWithHandler.forEach((card) => console.info(formatCoverageLine(card, true)));
  coverage.cardsMissingHandler.forEach((card) => console.info(formatCoverageLine(card, false)));
  console.info(
    `${coverage.cardsWithHandler.length}/${coverage.cardsWithEffect.length} cartas com efeito possuem handler.`,
  );
}

export function logEffectCoverageForTutorialDecks() {
  const makotoCoverage = getDeckEffectCoverage(
    makotoPeronaMainDeck,
    makotoPeronaLeaderCardId,
    cardDatabase,
    effectRegistry,
  );
  const koroCoverage = getDeckEffectCoverage(
    koroLucciMainDeck,
    koroLucciLeaderCardId,
    cardDatabase,
    effectRegistry,
  );

  console.info("[EFFECT COVERAGE]");
  logDeckCoverage("Makoto/Perona", makotoCoverage);
  logDeckCoverage("Koro/Lucci", koroCoverage);
}
