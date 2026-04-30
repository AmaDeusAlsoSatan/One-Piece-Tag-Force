import type { GameState, Phase, PlayerId } from "./types";
import { applyDonPhase, applyRefreshPhase } from "./donFlow";
import { applyDrawPhase } from "./drawFlow";
import { clearTemporaryModifiers } from "./effects/effectHelpers";

const phaseOrder: Phase[] = ["refresh", "draw", "don", "main", "end"];

function getNextPlayer(player: PlayerId): PlayerId {
  return player === "player" ? "opponent" : "player";
}

function formatPlayer(player: PlayerId) {
  return player === "player" ? "Jogador" : "Oponente";
}

function formatPhase(phase: Phase) {
  const labels: Record<Phase, string> = {
    refresh: "Refresh",
    draw: "Draw",
    don: "DON!!",
    main: "Main",
    end: "End",
    gameOver: "Game Over",
  };

  return labels[phase];
}

function applyPhaseStartEffects(gameState: GameState): GameState {
  if (gameState.phase === "refresh") {
    return applyRefreshPhase(gameState);
  }

  if (gameState.phase === "draw") {
    return applyDrawPhase(gameState);
  }

  if (gameState.phase === "don") {
    return applyDonPhase(gameState);
  }

  return gameState;
}

export function advancePhase(gameState: GameState): GameState {
  if (gameState.phase === "gameOver") {
    return gameState;
  }

  if (gameState.phase === "end") {
    const nextPlayer = getNextPlayer(gameState.turnPlayer);
    const nextTurnNumber = gameState.turnNumber + 1;
    const clearedState = clearTemporaryModifiers({
      ...gameState,
      usedThisTurn: [],
    });

    return applyPhaseStartEffects({
      ...clearedState,
      phase: "refresh",
      turnPlayer: nextPlayer,
      turnNumber: nextTurnNumber,
      log: [
        `${formatPlayer(nextPlayer)} inicia o turno ${nextTurnNumber} na fase Refresh.`,
        ...gameState.log,
      ],
    });
  }

  const currentIndex = phaseOrder.indexOf(gameState.phase);
  const nextPhase = phaseOrder[currentIndex + 1] ?? "refresh";

  return applyPhaseStartEffects({
    ...gameState,
    phase: nextPhase,
    log: [
      `${formatPlayer(gameState.turnPlayer)} avançou para ${formatPhase(nextPhase)}.`,
      ...gameState.log,
    ],
  });
}
