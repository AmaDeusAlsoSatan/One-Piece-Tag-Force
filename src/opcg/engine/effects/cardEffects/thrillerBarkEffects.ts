import type { CardEffectHandler, PendingEffect } from "../effectTypes";
import {
  getCardByRef,
  getCharacterTargetsByEffectiveCost,
  getOpponent,
  getPlayerLabel,
  koCharacter,
  withLog,
} from "../effectHelpers";

export const ryumaEffects: CardEffectHandler[] = [
  {
    id: "OP06-036-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }): PendingEffect => ({
      effectId: "OP06-036-on-play",
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "onPlay",
      prompt: "Escolha ate 1 Character descansado do oponente com custo 4 ou menos para K.O.",
      validTargets: getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 4, {
        restedOnly: true,
      }).map(({ ref }) => ref),
      optional: true,
    }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Ryuma.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Ryuma nao existe mais.");
      }

      return withLog(
        koCharacter(gameState, target),
        `${getPlayerLabel(controller)} deu K.O. em ${targetCard.name} com Ryuma.`,
      );
    },
  },
];
