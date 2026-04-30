import type { CardInstance, PlayerId } from "../engine/types";
import { createCardInstance, mockDonCard, mockLeaders, mockMainDeckCards } from "./mockCards";

function createMainDeck(owner: PlayerId): CardInstance[] {
  return Array.from({ length: 50 }, (_, index) => {
    const definition = mockMainDeckCards[index % mockMainDeckCards.length];
    return createCardInstance(definition, owner, `${owner}-deck-${index + 1}`, {
      faceUp: false,
    });
  });
}

function createDonDeck(owner: PlayerId): CardInstance[] {
  return Array.from({ length: 10 }, (_, index) =>
    createCardInstance(mockDonCard, owner, `${owner}-don-${index + 1}`, {
      faceUp: true,
    }),
  );
}

export function createMockLeader(owner: PlayerId): CardInstance {
  return createCardInstance(mockLeaders[owner], owner, `${owner}-leader`);
}

export function createMockPlayerDeck(owner: PlayerId): CardInstance[] {
  return createMainDeck(owner);
}

export function createMockDonDeck(owner: PlayerId): CardInstance[] {
  return createDonDeck(owner);
}
