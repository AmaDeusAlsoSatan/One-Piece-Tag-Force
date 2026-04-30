import type { CardEffectHandler, PendingEffect } from "../effectTypes";
import {
  getCardByRef,
  getCharacterTargetsByEffectiveCost,
  getOpponent,
  getPlayerLabel,
  restCard,
  withLog,
} from "../effectHelpers";

export const izoEffects: CardEffectHandler[] = [
  {
    id: "OP01-033-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }): PendingEffect => ({
      effectId: "OP01-033-on-play",
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "onPlay",
      prompt: "Escolha ate 1 Character do oponente com custo 4 ou menos para descansar.",
      validTargets: getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 4)
        .filter(({ card }) => card.active)
        .map(({ ref }) => ref),
      optional: true,
    }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Izo.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Izo nao existe mais.");
      }

      return withLog(
        restCard(gameState, target),
        `${getPlayerLabel(controller)} descansou ${targetCard.name} com Izo.`,
      );
    },
  },
];
