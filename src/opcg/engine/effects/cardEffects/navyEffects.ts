import type { CardEffectHandler, PendingEffect } from "../effectTypes";
import {
  applyCostModifier,
  getCardByRef,
  getOpponentCharacters,
  getPlayerLabel,
  withLog,
} from "../effectHelpers";

export const tsuruEffects: CardEffectHandler[] = [
  {
    id: "OP02-106-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }): PendingEffect => ({
      effectId: "OP02-106-on-play",
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "onPlay",
      prompt: "Escolha ate 1 Character do oponente para receber -2 custo.",
      validTargets: getOpponentCharacters(gameState, controller).map(({ ref }) => ref),
      optional: true,
    }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Tsuru.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Tsuru nao existe mais.");
      }

      return withLog(
        applyCostModifier(gameState, target, -2),
        `${getPlayerLabel(controller)} reduziu o custo de ${targetCard.name} em 2 com Tsuru.`,
      );
    },
  },
];

export const iceAgeEffects: CardEffectHandler[] = [
  {
    id: "OP02-117-event-main",
    timing: "eventMain",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }): PendingEffect => ({
      effectId: "OP02-117-event-main",
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "eventMain",
      prompt: "Escolha ate 1 Character do oponente para receber -5 custo.",
      validTargets: getOpponentCharacters(gameState, controller).map(({ ref }) => ref),
      optional: true,
    }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Ice Age.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Ice Age nao existe mais.");
      }

      return withLog(
        applyCostModifier(gameState, target, -5),
        `${getPlayerLabel(controller)} reduziu o custo de ${targetCard.name} em 5 com Ice Age.`,
      );
    },
  },
];
