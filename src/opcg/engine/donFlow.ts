import type { CardInstance, GameState, PlayerId, PlayerState } from "./types";
import { getPlayerLabel } from "./validators";

function refreshCard(card: CardInstance | null): CardInstance | null {
  return card ? { ...card, active: true, attachedDon: [], attachedDonIds: [] } : null;
}

function updatePlayer(gameState: GameState, player: PlayerId, playerState: PlayerState): GameState {
  return {
    ...gameState,
    players: {
      ...gameState.players,
      [player]: playerState,
    },
  };
}

export function applyRefreshPhase(gameState: GameState): GameState {
  const player = gameState.turnPlayer;
  const playerState = gameState.players[player];
  const returnedDon = [
    ...playerState.leader.attachedDon,
    ...playerState.characterArea.flatMap((card) => card?.attachedDon ?? []),
  ].map((don) => ({
    ...don,
    active: true,
    faceUp: true,
    attachedDon: [],
    attachedDonIds: [],
  }));
  const refreshedPlayer: PlayerState = {
    ...playerState,
    leader: { ...playerState.leader, active: true, attachedDon: [], attachedDonIds: [] },
    characterArea: playerState.characterArea.map(refreshCard),
    stage: refreshCard(playerState.stage),
    costArea: [...playerState.costArea, ...returnedDon].map((don) => ({ ...don, active: true })),
  };

  return {
    ...updatePlayer(gameState, player, refreshedPlayer),
    log: [`${getPlayerLabel(player)} refrescou suas cartas.`, ...gameState.log],
  };
}

export function applyDonPhase(gameState: GameState): GameState {
  const player = gameState.turnPlayer;
  const playerState = gameState.players[player];
  const isFirstTurnForFirstPlayer = gameState.turnNumber === 1 && player === gameState.firstPlayer;
  const donToMove = isFirstTurnForFirstPlayer ? 1 : 2;
  const movedDon = playerState.donDeck.slice(0, donToMove).map((don) => ({
    ...don,
    active: true,
    faceUp: true,
  }));

  if (movedDon.length === 0) {
    return {
      ...gameState,
      log: [`${getPlayerLabel(player)} não tem mais DON!! no DON!! Deck.`, ...gameState.log],
    };
  }

  const updatedPlayer: PlayerState = {
    ...playerState,
    donDeck: playerState.donDeck.slice(movedDon.length),
    costArea: [...playerState.costArea, ...movedDon],
  };

  return {
    ...updatePlayer(gameState, player, updatedPlayer),
    log: [
      `${getPlayerLabel(player)} colocou ${movedDon.length} DON!! na Cost Area.`,
      ...gameState.log,
    ],
  };
}
