import { buildDeckFromDeckList, buildLeaderFromCardId, buildRealDonDeck } from "../data/buildDeckFromDeckList";
import { cardDatabase } from "../data/cardDatabase";
import { koroLucciLeaderCardId, koroLucciMainDeck } from "../data/decklists/koroLucciDeck";
import { makotoPeronaLeaderCardId, makotoPeronaMainDeck } from "../data/decklists/makotoPeronaDeck";
import { createMockDonDeck, createMockLeader, createMockPlayerDeck } from "../data/mockDecks";
import type { CardInstance, GameState, PlayerId, PlayerState } from "./types";
import { getPlayerLabel } from "./validators";

type CreateInitialGameStateOptions = {
  useRealDecks?: boolean;
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function drawCards(deck: CardInstance[], amount: number) {
  return {
    drawn: deck.slice(0, amount).map((card) => ({ ...card, faceUp: true })),
    remainingDeck: deck.slice(amount),
  };
}

function createLife(deck: CardInstance[], amount: number) {
  return {
    life: deck.slice(0, amount).map((card) => ({ ...card, faceUp: false })),
    remainingDeck: deck.slice(amount),
  };
}

function createMockPlayerState(playerId: PlayerId): PlayerState {
  return createPlayerState(playerId, createMockLeader(playerId), createMockPlayerDeck(playerId), createMockDonDeck(playerId));
}

function createRealPlayerState(playerId: PlayerId): PlayerState {
  const isPlayer = playerId === "player";
  const leaderCardId = isPlayer ? makotoPeronaLeaderCardId : koroLucciLeaderCardId;
  const mainDeck = isPlayer ? makotoPeronaMainDeck : koroLucciMainDeck;

  return createPlayerState(
    playerId,
    buildLeaderFromCardId(playerId, leaderCardId, cardDatabase),
    buildDeckFromDeckList({
      owner: playerId,
      deckList: mainDeck,
      cardDatabase,
    }),
    buildRealDonDeck(playerId),
  );
}

function createPlayerState(
  playerId: PlayerId,
  leader: CardInstance,
  deck: CardInstance[],
  donDeck: CardInstance[],
): PlayerState {
  const shuffledDeck = shuffle(deck);
  const startingHand = drawCards(shuffledDeck, 5);
  const startingLife = createLife(startingHand.remainingDeck, leader.life ?? 5);

  return {
    leader,
    deck: startingLife.remainingDeck,
    hand: startingHand.drawn,
    life: startingLife.life,
    trash: [],
    characterArea: [null, null, null, null, null],
    stage: null,
    costArea: [],
    donDeck,
  };
}

export function createInitialGameState(
  firstPlayer: PlayerId = "player",
  options: CreateInitialGameStateOptions = {},
): GameState {
  const hasImportedCards = Object.keys(cardDatabase).length > 0;
  const useRealDecks = options.useRealDecks ?? hasImportedCards;
  const createState = useRealDecks ? createRealPlayerState : createMockPlayerState;

  return {
    players: {
      player: createState("player"),
      opponent: createState("opponent"),
    },
    turnPlayer: firstPlayer,
    firstPlayer,
    phase: "refresh",
    turnNumber: 1,
    log: [
      `${getPlayerLabel(firstPlayer)} iniciou na fase Refresh.`,
      `${getPlayerLabel(firstPlayer)} refrescou suas cartas.`,
      useRealDecks
        ? "Mesa de duelo criada com decks reais locais."
        : "Mesa de duelo criada com decks mockados.",
    ],
  };
}
