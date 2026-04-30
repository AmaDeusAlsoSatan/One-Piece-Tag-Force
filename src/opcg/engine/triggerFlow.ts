import { processNextLeaderDamage } from "./damageFlow";
import type { CardInstance, GameState, PlayerId, PlayerState } from "./types";
import { getPlayerLabel, validatePendingLifeTriggerAction } from "./validators";

function updatePlayer(gameState: GameState, player: PlayerId, playerState: PlayerState): GameState {
  return {
    ...gameState,
    players: {
      ...gameState.players,
      [player]: playerState,
    },
  };
}

function withLog(gameState: GameState, message: string): GameState {
  return {
    ...gameState,
    log: [message, ...gameState.log],
  };
}

function prepareTriggerCard(card: CardInstance): CardInstance {
  return {
    ...card,
    active: true,
    faceUp: true,
    attachedDon: [],
    attachedDonIds: [],
  };
}

export function addTriggerCardToHand(gameState: GameState, player: PlayerId): GameState {
  const validation = validatePendingLifeTriggerAction(gameState, player);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const pendingTrigger = gameState.pendingLifeTrigger;

  if (!pendingTrigger) {
    return withLog(gameState, "Nao ha Trigger pendente para adicionar a mao.");
  }

  const playerState = gameState.players[player];
  const updatedPlayer: PlayerState = {
    ...playerState,
    hand: [...playerState.hand, prepareTriggerCard(pendingTrigger.card)],
  };

  return processNextLeaderDamage(
    withLog(
      {
        ...updatePlayer(gameState, player, updatedPlayer),
        pendingLifeTrigger: undefined,
      },
      `${getPlayerLabel(player)} adicionou ${pendingTrigger.card.name} a mao.`,
    ),
  );
}

export function activateLifeTrigger(gameState: GameState, player: PlayerId): GameState {
  const validation = validatePendingLifeTriggerAction(gameState, player);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const pendingTrigger = gameState.pendingLifeTrigger;

  if (!pendingTrigger) {
    return withLog(gameState, "Nao ha Trigger pendente para ativar.");
  }

  const playerState = gameState.players[player];
  const updatedPlayer: PlayerState = {
    ...playerState,
    trash: [prepareTriggerCard(pendingTrigger.card), ...playerState.trash],
  };

  return processNextLeaderDamage(
    withLog(
      {
        ...updatePlayer(gameState, player, updatedPlayer),
        pendingLifeTrigger: undefined,
      },
      `${getPlayerLabel(player)} ativou o Trigger de ${pendingTrigger.card.name}. Efeito real ainda nao implementado.`,
    ),
  );
}
