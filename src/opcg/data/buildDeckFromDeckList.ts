import type { CardInstance, PlayerId } from "../engine/types";
import type { DeckListEntry, NormalizedCardData } from "./cardDatabaseTypes";
import { createCardInstance, mockDonCard } from "./mockCards";

function createInstanceFromCardData(card: NormalizedCardData, owner: PlayerId, instanceId: string): CardInstance {
  return {
    instanceId,
    cardId: card.cardId,
    name: card.name,
    type: card.type,
    owner,
    controller: owner,
    cost: card.cost,
    power: card.power,
    counter: card.counter,
    colors: card.colors,
    traits: card.traits,
    effect: card.effect,
    triggerText: card.triggerText,
    trigger: card.triggerText
      ? {
          label: card.triggerText,
          kind: "placeholder",
        }
      : undefined,
    rarity: card.rarity,
    set: card.set,
    imageUrl: card.imageUrl,
    keywords: card.keywords,
    active: true,
    faceUp: false,
    attachedDonIds: [],
    attachedDon: [],
    tempCostModifier: 0,
    tempPowerModifier: 0,
    life: card.life,
  };
}

export function buildDeckFromDeckList(params: {
  owner: PlayerId;
  deckList: DeckListEntry[];
  cardDatabase: Record<string, NormalizedCardData>;
}): CardInstance[] {
  const deck: CardInstance[] = [];

  for (const entry of params.deckList) {
    const card = params.cardDatabase[entry.cardId];

    if (!card) {
      throw new Error(`CardId ${entry.cardId} was not found in the local OPTCG card database.`);
    }

    for (let copyIndex = 1; copyIndex <= entry.count; copyIndex += 1) {
      deck.push(
        createInstanceFromCardData(
          card,
          params.owner,
          `${params.owner}-${entry.cardId}-${copyIndex}-${deck.length + 1}`,
        ),
      );
    }
  }

  if (deck.length !== 50) {
    throw new Error(`Deck for ${params.owner} must contain exactly 50 cards, got ${deck.length}.`);
  }

  // TODO: validate deck color identity against Leader colors.
  return deck;
}

export function buildLeaderFromCardId(
  owner: PlayerId,
  cardId: string,
  database: Record<string, NormalizedCardData>,
): CardInstance {
  const card = database[cardId];

  if (!card) {
    throw new Error(`Leader cardId ${cardId} was not found in the local OPTCG card database.`);
  }

  if (card.type !== "leader") {
    throw new Error(`CardId ${cardId} is ${card.type}, not leader.`);
  }

  return {
    ...createInstanceFromCardData(card, owner, `${owner}-leader-${cardId}`),
    faceUp: true,
  };
}

export function buildRealDonDeck(owner: PlayerId): CardInstance[] {
  return Array.from({ length: 10 }, (_, index) =>
    createCardInstance(mockDonCard, owner, `${owner}-don-${index + 1}`, {
      faceUp: true,
    }),
  );
}
