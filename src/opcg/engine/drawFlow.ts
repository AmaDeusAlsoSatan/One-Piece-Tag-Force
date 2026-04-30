import type { GameState, PlayerId, PlayerState } from "./types";
import { getOpponent, getPlayerLabel } from "./validators";

function updatePlayer(gameState: GameState, player: PlayerId, playerState: PlayerState): GameState {
  return {
    ...gameState,
    players: {
      ...gameState.players,
      [player]: playerState,
    },
  };
}

export function applyDrawPhase(gameState: GameState): GameState {
  const player = gameState.turnPlayer;
  const playerState = gameState.players[player];
  const isFirstTurnForFirstPlayer = gameState.turnNumber === 1 && player === gameState.firstPlayer;

  if (isFirstTurnForFirstPlayer) {
    return {
      ...gameState,
      log: [`${getPlayerLabel(player)} não compra no primeiro turno.`, ...gameState.log],
    };
  }

  if (playerState.deck.length === 0) {
    const winner = getOpponent(player);

    return {
      ...gameState,
      phase: "gameOver",
      winner,
      log: [
        `${getPlayerLabel(player)} não tinha cartas no deck e perdeu o duelo.`,
        ...gameState.log,
      ],
    };
  }

  const [drawnCard, ...remainingDeck] = playerState.deck;
  const updatedPlayer: PlayerState = {
    ...playerState,
    deck: remainingDeck,
    hand: [...playerState.hand, { ...drawnCard, faceUp: true }],
  };

  return {
    ...updatePlayer(gameState, player, updatedPlayer),
    log: [`${getPlayerLabel(player)} comprou 1 carta.`, ...gameState.log],
  };
}
