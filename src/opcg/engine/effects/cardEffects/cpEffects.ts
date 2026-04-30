import type { CardEffectHandler, CardRef, PendingEffect } from "../effectTypes";
import type { GameState, PlayerId } from "../../types";
import {
  applyCostModifier,
  cardHasTraitIncluding,
  getCardByRef,
  getCharacterTargetsByEffectiveCost,
  getOpponent,
  getOpponentCharacters,
  getPlayerLabel,
  koCharacter,
  returnFirstTrashCardsToBottomDeck,
  trashTopDeck,
  withLog,
} from "../effectHelpers";

function cpTrashCostAvailable(gameState: GameState, controller: PlayerId, amount: number) {
  return gameState.players[controller].trash.filter((card) => cardHasTraitIncluding(card, "CP")).length >= amount;
}

function payCpTrashCost(gameState: GameState, controller: PlayerId, amount: number) {
  return returnFirstTrashCardsToBottomDeck(gameState, controller, amount, (card) => cardHasTraitIncluding(card, "CP"));
}

function createTargetingEffect(params: {
  effectId: string;
  gameState: GameState;
  source: CardRef;
  sourceCardId: string;
  sourceName: string;
  controller: PlayerId;
  prompt: string;
  validTargets: CardRef[];
}): PendingEffect {
  return {
    effectId: params.effectId,
    source: params.source,
    sourceCardId: params.sourceCardId,
    sourceName: params.sourceName,
    controller: params.controller,
    timing: params.effectId.includes("when-attacking") ? "whenAttacking" : "onPlay",
    prompt: params.prompt,
    validTargets: params.validTargets,
    optional: true,
  };
}

export const robLucciLeaderEffects: CardEffectHandler[] = [
  {
    id: "OP07-079-when-attacking",
    timing: "whenAttacking",
    canActivate: ({ gameState, controller }) =>
      gameState.turnPlayer === controller && gameState.players[controller].deck.length >= 2,
    createPendingEffect: ({ gameState, source, sourceCard, controller }) =>
      createTargetingEffect({
        effectId: "OP07-079-when-attacking",
        gameState,
        source,
        sourceCardId: sourceCard.cardId,
        sourceName: sourceCard.name,
        controller,
        prompt: "Você pode trashar 2 cartas do topo do deck para dar -1 custo a até 1 Character do oponente.",
        validTargets: getOpponentCharacters(gameState, controller).map(({ ref }) => ref),
      }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao ativou o efeito de Rob Lucci.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Rob Lucci nao existe mais.");
      }

      const paidState = trashTopDeck(gameState, controller, 2);

      return withLog(
        applyCostModifier(paidState, target, -1),
        `${getPlayerLabel(controller)} trashou 2 cartas do topo do deck para reduzir o custo de ${targetCard.name} em 1 com Rob Lucci.`,
      );
    },
  },
];

export const op03KakuEffects: CardEffectHandler[] = [
  {
    id: "OP03-080-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }) =>
      createTargetingEffect({
        effectId: "OP03-080-on-play",
        gameState,
        source,
        sourceCardId: sourceCard.cardId,
        sourceName: sourceCard.name,
        controller,
        prompt: "Devolva 2 cartas CP do Trash ao fundo do deck para dar K.O. em 1 Character custo 3 ou menos.",
        validTargets: cpTrashCostAvailable(gameState, controller, 2)
          ? getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 3).map(({ ref }) => ref)
          : [],
      }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Kaku.`);
      }

      const targetCard = getCardByRef(gameState, target);
      const { gameState: paidState, movedCards } = payCpTrashCost(gameState, controller, 2);

      if (!targetCard || movedCards.length < 2) {
        return withLog(gameState, "Kaku nao conseguiu pagar o custo ou o alvo nao existe mais.");
      }

      return withLog(
        koCharacter(paidState, target),
        `${getPlayerLabel(controller)} devolveu 2 cartas CP ao deck e deu K.O. em ${targetCard.name} com Kaku.`,
      );
    },
  },
];

export const op07KakuEffects: CardEffectHandler[] = [
  {
    id: "OP07-080-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }) =>
      createTargetingEffect({
        effectId: "OP07-080-on-play",
        gameState,
        source,
        sourceCardId: sourceCard.cardId,
        sourceName: sourceCard.name,
        controller,
        prompt: "Devolva 2 cartas CP do Trash ao fundo do deck para dar -3 custo a até 1 Character do oponente.",
        validTargets: cpTrashCostAvailable(gameState, controller, 2)
          ? getOpponentCharacters(gameState, controller).map(({ ref }) => ref)
          : [],
      }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Kaku.`);
      }

      const targetCard = getCardByRef(gameState, target);
      const { gameState: paidState, movedCards } = payCpTrashCost(gameState, controller, 2);

      if (!targetCard || movedCards.length < 2) {
        return withLog(gameState, "Kaku nao conseguiu pagar o custo ou o alvo nao existe mais.");
      }

      return withLog(
        applyCostModifier(paidState, target, -3),
        `${getPlayerLabel(controller)} devolveu 2 cartas CP ao deck e reduziu o custo de ${targetCard.name} em 3 com Kaku.`,
      );
    },
  },
];

export const op05RobLucciEffects: CardEffectHandler[] = [
  {
    id: "OP05-093-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }) =>
      createTargetingEffect({
        effectId: "OP05-093-on-play",
        gameState,
        source,
        sourceCardId: sourceCard.cardId,
        sourceName: sourceCard.name,
        controller,
        prompt: "Devolva 3 cartas do Trash ao fundo do deck para dar K.O. em Characters pequenos.",
        validTargets:
          gameState.players[controller].trash.length >= 3
            ? getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 2).map(({ ref }) => ref)
            : [],
      }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Rob Lucci.`);
      }

      const firstTarget = getCardByRef(gameState, target);
      const { gameState: paidState, movedCards } = returnFirstTrashCardsToBottomDeck(gameState, controller, 3);

      if (!firstTarget || movedCards.length < 3) {
        return withLog(gameState, "Rob Lucci nao conseguiu pagar o custo ou o alvo nao existe mais.");
      }

      let resolvedState = koCharacter(paidState, target);
      const secondTarget = getCharacterTargetsByEffectiveCost(resolvedState, getOpponent(controller), 1).filter(
        ({ ref }) => !(ref.zone === "character" && target.zone === "character" && ref.slotIndex === target.slotIndex),
      )[0];

      if (secondTarget) {
        const secondTargetCard = secondTarget.card;
        resolvedState = koCharacter(resolvedState, secondTarget.ref);
        return withLog(
          resolvedState,
          `${getPlayerLabel(controller)} devolveu 3 cartas ao deck e deu K.O. em ${firstTarget.name} e ${secondTargetCard.name} com Rob Lucci.`,
        );
      }

      return withLog(
        resolvedState,
        `${getPlayerLabel(controller)} devolveu 3 cartas ao deck e deu K.O. em ${firstTarget.name} com Rob Lucci.`,
      );
    },
  },
];

export const josephEffects: CardEffectHandler[] = [
  {
    id: "OP07-092-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller }) =>
      createTargetingEffect({
        effectId: "OP07-092-on-play",
        gameState,
        source,
        sourceCardId: sourceCard.cardId,
        sourceName: sourceCard.name,
        controller,
        prompt: "Devolva 2 cartas CP do Trash ao fundo do deck para dar K.O. em 1 Character custo 1 ou menos.",
        validTargets: cpTrashCostAvailable(gameState, controller, 2)
          ? getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 1).map(({ ref }) => ref)
          : [],
      }),
    resolve: ({ gameState, controller }, target) => {
      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Joseph.`);
      }

      const targetCard = getCardByRef(gameState, target);
      const { gameState: paidState, movedCards } = payCpTrashCost(gameState, controller, 2);

      if (!targetCard || movedCards.length < 2) {
        return withLog(gameState, "Joseph nao conseguiu pagar o custo ou o alvo nao existe mais.");
      }

      return withLog(
        koCharacter(paidState, target),
        `${getPlayerLabel(controller)} devolveu 2 cartas CP ao deck e deu K.O. em ${targetCard.name} com Joseph.`,
      );
    },
  },
];
