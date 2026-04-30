import type { GameAction } from "./actions";
import { attachDon } from "./attachDon";
import {
  declareAttack,
  passBlock,
  passCounter,
  resolvePendingBattle,
  useBlocker,
  useCharacterCounter,
  useEventCounter,
} from "./battle";
import { processNextLeaderDamage } from "./damageFlow";
import { payCost } from "./payCost";
import { activateLifeTrigger, addTriggerCardToHand } from "./triggerFlow";
import { advancePhase } from "./turnFlow";
import type { CardInstance, GameState, PlayerId, PlayerState } from "./types";
import {
  canPayCost,
  findCardInHand,
  getPlayerLabel,
  validateCharacterSlot,
  validateMainPhaseAction,
} from "./validators";

function withLog(gameState: GameState, message: string): GameState {
  return {
    ...gameState,
    log: [message, ...gameState.log],
  };
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

function removeFromHand(playerState: PlayerState, cardInstanceId: string): CardInstance[] {
  return playerState.hand.filter((card) => card.instanceId !== cardInstanceId);
}

function playCharacter(
  gameState: GameState,
  player: PlayerId,
  playerState: PlayerState,
  card: CardInstance,
  targetSlotIndex: number | undefined,
): GameState {
  const slotValidation = validateCharacterSlot(playerState, targetSlotIndex);

  if (!slotValidation.valid) {
    return withLog(gameState, slotValidation.message);
  }

  const slotIndex = targetSlotIndex as number;
  const cost = card.cost ?? 0;

  if (!canPayCost(playerState, cost)) {
    return withLog(gameState, `${getPlayerLabel(player)} não tem DON!! ativo suficiente para jogar ${card.name}.`);
  }

  const paidPlayer = payCost(playerState, cost);
  const characterArea = [...paidPlayer.characterArea];
  characterArea[slotIndex] = {
    ...card,
    active: true,
    faceUp: true,
    playedTurn: gameState.turnNumber,
  };

  const updatedPlayer: PlayerState = {
    ...paidPlayer,
    hand: removeFromHand(paidPlayer, card.instanceId),
    characterArea,
  };

  return withLog(
    updatePlayer(gameState, player, updatedPlayer),
    `${getPlayerLabel(player)} jogou ${card.name} no slot C${slotIndex + 1}.`,
  );
}

function playStage(
  gameState: GameState,
  player: PlayerId,
  playerState: PlayerState,
  card: CardInstance,
): GameState {
  const cost = card.cost ?? 0;

  if (!canPayCost(playerState, cost)) {
    return withLog(gameState, `${getPlayerLabel(player)} não tem DON!! ativo suficiente para jogar ${card.name}.`);
  }

  const paidPlayer = payCost(playerState, cost);
  const replacedStage = paidPlayer.stage;
  const updatedPlayer: PlayerState = {
    ...paidPlayer,
    hand: removeFromHand(paidPlayer, card.instanceId),
    stage: {
      ...card,
      active: true,
      faceUp: true,
      playedTurn: gameState.turnNumber,
    },
    trash: replacedStage ? [replacedStage, ...paidPlayer.trash] : paidPlayer.trash,
  };

  const replaceMessage = replacedStage ? `, substituindo ${replacedStage.name}` : "";

  return withLog(
    updatePlayer(gameState, player, updatedPlayer),
    `${getPlayerLabel(player)} jogou ${card.name} na Stage${replaceMessage}.`,
  );
}

function playEvent(
  gameState: GameState,
  player: PlayerId,
  playerState: PlayerState,
  card: CardInstance,
): GameState {
  const cost = card.cost ?? 0;

  if (!canPayCost(playerState, cost)) {
    return withLog(gameState, `${getPlayerLabel(player)} não tem DON!! ativo suficiente para usar ${card.name}.`);
  }

  const paidPlayer = payCost(playerState, cost);
  const updatedPlayer: PlayerState = {
    ...paidPlayer,
    hand: removeFromHand(paidPlayer, card.instanceId),
    trash: [{ ...card, active: true, faceUp: true }, ...paidPlayer.trash],
  };

  return withLog(
    updatePlayer(gameState, player, updatedPlayer),
    `${getPlayerLabel(player)} usou ${card.name}, mas o efeito ainda não foi implementado.`,
  );
}

function playCardFromHand(gameState: GameState, action: Extract<GameAction, { type: "PLAY_CARD_FROM_HAND" }>) {
  const phaseValidation = validateMainPhaseAction(gameState, action.player);

  if (!phaseValidation.valid) {
    return withLog(gameState, phaseValidation.message);
  }

  const playerState = gameState.players[action.player];
  const card = findCardInHand(playerState, action.cardInstanceId);

  if (!card) {
    return withLog(gameState, "Essa carta não está na mão do jogador.");
  }

  if (card.type === "character") {
    return playCharacter(gameState, action.player, playerState, card, action.targetSlotIndex);
  }

  if (card.type === "stage") {
    return playStage(gameState, action.player, playerState, card);
  }

  if (card.type === "event") {
    return playEvent(gameState, action.player, playerState, card);
  }

  return withLog(gameState, `${card.name} não pode ser jogada da mão agora.`);
}

export function gameReducer(gameState: GameState, action: GameAction): GameState {
  if (
    gameState.pendingLeaderDamage &&
    !gameState.pendingLifeTrigger &&
    action.type !== "ACTIVATE_LIFE_TRIGGER" &&
    action.type !== "ADD_TRIGGER_CARD_TO_HAND"
  ) {
    return processNextLeaderDamage(gameState);
  }

  switch (action.type) {
    case "ADVANCE_PHASE":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      if (gameState.pendingBattle) {
        return withLog(gameState, "Resolva a batalha atual antes de avançar a fase.");
      }

      return advancePhase(gameState);
    case "ACTIVATE_LIFE_TRIGGER":
      return activateLifeTrigger(gameState, action.player);
    case "ADD_TRIGGER_CARD_TO_HAND":
      return addTriggerCardToHand(gameState, action.player);
    case "RESOLVE_PENDING_BATTLE":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return resolvePendingBattle(gameState);
    case "PASS_BLOCK":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return passBlock(gameState, action.player);
    case "PASS_COUNTER":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return passCounter(gameState, action.player);
    case "USE_BLOCKER":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return useBlocker(gameState, action.player, action.blockerSlotIndex);
    case "USE_CHARACTER_COUNTER":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return useCharacterCounter(gameState, action.player, action.cardInstanceId);
    case "USE_EVENT_COUNTER":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return useEventCounter(gameState, action.player, action.cardInstanceId);
    case "ATTACH_DON":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return attachDon(gameState, action.player, action.donInstanceId, action.target);
    case "DECLARE_ATTACK":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return declareAttack(gameState, action.player, action.source, action.target);
    case "PLAY_CARD_FROM_HAND":
      if (gameState.pendingLifeTrigger) {
        return withLog(gameState, "Resolva o Trigger pendente antes de continuar.");
      }

      return playCardFromHand(gameState, action);
    default:
      return gameState;
  }
}
