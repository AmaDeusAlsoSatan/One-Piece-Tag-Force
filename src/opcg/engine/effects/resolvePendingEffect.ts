import type { GameState, PlayerId } from "../types";
import type { CardRef, EffectTiming } from "./effectTypes";
import { cardRefEquals, getCardByRef, getPlayerLabel, withLog } from "./effectHelpers";
import { getCardEffectHandlers } from "./effectRegistry";

function createPendingEffectFromHandler(
  gameState: GameState,
  player: PlayerId,
  source: CardRef,
  timing: EffectTiming,
  modeId?: string,
): GameState {
  const sourceCard = getCardByRef(gameState, source);

  if (!sourceCard) {
    return withLog(gameState, "A fonte do efeito nao existe mais.");
  }

  const handler = getCardEffectHandlers(sourceCard.cardId, timing).find((candidate) =>
    candidate.canActivate({
      gameState,
      source,
      sourceCard,
      controller: player,
      timing,
      modeId,
    }),
  );

  if (!handler) {
    return withLog(gameState, `${sourceCard.name} nao tem efeito disponivel agora.`);
  }

  const ctx = {
    gameState,
    source,
    sourceCard,
    controller: player,
    timing,
    modeId,
  };

  if (handler.createPendingEffect) {
    return {
      ...gameState,
      pendingEffect: handler.createPendingEffect(ctx),
    };
  }

  if (handler.resolve) {
    return handler.resolve(ctx, undefined, modeId);
  }

  return withLog(gameState, `${sourceCard.name} ainda nao tem resolucao de efeito.`);
}

export function triggerCardEffects(
  gameState: GameState,
  source: CardRef,
  controller: PlayerId,
  timing: EffectTiming,
): GameState {
  const sourceCard = getCardByRef(gameState, source);

  if (!sourceCard || getCardEffectHandlers(sourceCard.cardId, timing).length === 0) {
    return gameState;
  }

  return createPendingEffectFromHandler(gameState, controller, source, timing);
}

export function activateCardEffect(
  gameState: GameState,
  player: PlayerId,
  source: CardRef,
  timing: EffectTiming,
  modeId?: string,
): GameState {
  if (gameState.phase !== "main" || gameState.turnPlayer !== player) {
    return withLog(gameState, "So o jogador do turno pode ativar efeito na Main Phase.");
  }

  if (gameState.pendingBattle || gameState.pendingLifeTrigger || gameState.pendingLeaderDamage) {
    return withLog(gameState, "Resolva as pendencias atuais antes de ativar outro efeito.");
  }

  return createPendingEffectFromHandler(gameState, player, source, timing, modeId);
}

export function selectEffectTarget(
  gameState: GameState,
  player: PlayerId,
  target?: CardRef,
  modeId?: string,
): GameState {
  const pendingEffect = gameState.pendingEffect;

  if (!pendingEffect) {
    return withLog(gameState, "Nao ha efeito pendente para resolver.");
  }

  if (pendingEffect.controller !== player) {
    return withLog(gameState, "Apenas o controlador do efeito pode resolver essa escolha.");
  }

  if (modeId && pendingEffect.modes?.some((mode) => mode.id === modeId)) {
    return createPendingEffectFromHandler(gameState, player, pendingEffect.source, pendingEffect.timing, modeId);
  }

  if (!target && !pendingEffect.optional) {
    return withLog(gameState, "Esse efeito precisa de um alvo.");
  }

  if (target && !pendingEffect.validTargets.some((validTarget) => cardRefEquals(validTarget, target))) {
    return withLog(gameState, "Esse alvo nao e valido para o efeito pendente.");
  }

  const sourceCard = getCardByRef(gameState, pendingEffect.source);

  if (!sourceCard) {
    return withLog(
      {
        ...gameState,
        pendingEffect: undefined,
      },
      "A fonte do efeito nao existe mais.",
    );
  }

  const handler = getCardEffectHandlers(sourceCard.cardId, pendingEffect.timing).find(
    (candidate) => candidate.id === pendingEffect.effectId,
  );

  if (!handler?.resolve) {
    return withLog(
      {
        ...gameState,
        pendingEffect: undefined,
      },
      `${sourceCard.name} ainda nao tem resolucao de efeito.`,
    );
  }

  return handler.resolve(
    {
      gameState: {
        ...gameState,
        pendingEffect: undefined,
      },
      source: pendingEffect.source,
      sourceCard,
      controller: player,
      timing: pendingEffect.timing,
      modeId: pendingEffect.selectedModeId,
    },
    target,
    pendingEffect.selectedModeId,
  );
}

export function cancelPendingEffect(gameState: GameState, player: PlayerId): GameState {
  const pendingEffect = gameState.pendingEffect;

  if (!pendingEffect) {
    return withLog(gameState, "Nao ha efeito pendente para cancelar.");
  }

  if (pendingEffect.controller !== player) {
    return withLog(gameState, "Apenas o controlador do efeito pode cancelar essa escolha.");
  }

  return withLog(
    {
      ...gameState,
      pendingEffect: undefined,
    },
    `${getPlayerLabel(player)} cancelou o efeito de ${pendingEffect.sourceName}.`,
  );
}
