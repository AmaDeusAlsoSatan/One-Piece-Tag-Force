import type { CardEffectHandler, PendingEffect } from "../effectTypes";
import {
  applyCostModifier,
  getCardByRef,
  getCharacterTargetsByEffectiveCost,
  getOpponent,
  getOpponentCharacters,
  getPlayerLabel,
  koCharacter,
  restCard,
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

function createRestForCostMinusTwoEffect(effectId: string, sourceName: string): CardEffectHandler {
  return {
    id: effectId,
    timing: "activateMain",
    canActivate: ({ gameState, source, sourceCard, controller }) =>
      gameState.phase === "main" &&
      gameState.turnPlayer === controller &&
      source.zone === "character" &&
      sourceCard.active,
    createPendingEffect: ({ gameState, source, sourceCard, controller }): PendingEffect => ({
      effectId,
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "activateMain",
      prompt: `Descanse ${sourceName} para dar -2 custo a ate 1 Character do oponente.`,
      validTargets: getOpponentCharacters(gameState, controller).map(({ ref }) => ref),
      optional: true,
    }),
    resolve: ({ gameState, source, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para ${sourceName}.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, `O alvo de ${sourceName} nao existe mais.`);
      }

      return withLog(
        applyCostModifier(restCard(gameState, source), target, -2),
        `${getPlayerLabel(controller)} descansou ${sourceName} e reduziu o custo de ${targetCard.name} em 2.`,
      );
    },
  };
}

export const tashigiEffects: CardEffectHandler[] = [
  createRestForCostMinusTwoEffect("ST06-006-activate-main", "Tashigi"),
];

export const utaEffects: CardEffectHandler[] = [
  createRestForCostMinusTwoEffect("ST08-002-activate-main", "Uta"),
];

export const xDrakeEffects: CardEffectHandler[] = [
  {
    id: "OP01-054-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }): PendingEffect => ({
      effectId: "OP01-054-on-play",
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
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para X.Drake.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de X.Drake nao existe mais.");
      }

      return withLog(
        koCharacter(gameState, target),
        `${getPlayerLabel(controller)} deu K.O. em ${targetCard.name} com X.Drake.`,
      );
    },
  },
];
