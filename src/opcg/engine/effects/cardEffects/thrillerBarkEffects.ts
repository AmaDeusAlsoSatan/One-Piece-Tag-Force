import type { CardEffectHandler, PendingEffect } from "../effectTypes";
import {
  applyCostModifier,
  getCardByRef,
  getCharacterTargetsByEffectiveCost,
  getOpponent,
  getOpponentCharacters,
  getPlayerLabel,
  koCharacter,
  moveFirstHandCardToTrash,
  returnFirstTrashCardsToBottomDeck,
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

const brookModes = [
  { id: "trash-cost-4", label: "Trashar Character custo 4 ou menos" },
  { id: "opponent-trash-bottom", label: "Oponente devolve 3 cartas do Trash ao deck" },
];

export const brookEffects: CardEffectHandler[] = [
  {
    id: "OP06-092-on-play",
    timing: "onPlay",
    canActivate: () => true,
    createPendingEffect: ({ gameState, source, sourceCard, controller, modeId }): PendingEffect => ({
      effectId: "OP06-092-on-play",
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "onPlay",
      prompt: modeId ? "Resolva o modo escolhido de Brook." : "Escolha um efeito de Brook.",
      modes: brookModes,
      selectedModeId: modeId,
      validTargets:
        modeId === "trash-cost-4"
          ? getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 4).map(({ ref }) => ref)
          : [],
      optional: true,
    }),
    resolve: ({ gameState, controller }, target, modeId) => {
      if (modeId === "opponent-trash-bottom") {
        const opponent = getOpponent(controller);
        const { gameState: movedState, movedCards } = returnFirstTrashCardsToBottomDeck(gameState, opponent, 3);

        if (movedCards.length < 3) {
          return withLog(gameState, `${getPlayerLabel(opponent)} nao tinha 3 cartas no Trash para Brook.`);
        }

        return withLog(
          movedState,
          `${getPlayerLabel(opponent)} colocou 3 cartas do Trash no fundo do deck por Brook.`,
        );
      }

      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Brook.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Brook nao existe mais.");
      }

      return withLog(
        koCharacter(gameState, target),
        `${getPlayerLabel(controller)} trashou ${targetCard.name} com Brook.`,
      );
    },
  },
];

const peronaCharacterModes = [
  { id: "trash-hand", label: "Oponente descarta 1 carta" },
  { id: "cost-minus-3", label: "Reduzir custo em -3" },
];

export const peronaCharacterEffects: CardEffectHandler[] = [
  {
    id: "OP06-093-on-play",
    timing: "onPlay",
    canActivate: ({ gameState, controller }) => gameState.players[getOpponent(controller)].hand.length >= 5,
    createPendingEffect: ({ gameState, source, sourceCard, controller, modeId }): PendingEffect => ({
      effectId: "OP06-093-on-play",
      source,
      sourceCardId: sourceCard.cardId,
      sourceName: sourceCard.name,
      controller,
      timing: "onPlay",
      prompt: modeId ? "Resolva o modo escolhido de Perona." : "O oponente tem 5+ cartas na mao. Escolha um efeito.",
      modes: peronaCharacterModes,
      selectedModeId: modeId,
      validTargets:
        modeId === "cost-minus-3" ? getOpponentCharacters(gameState, controller).map(({ ref }) => ref) : [],
      optional: true,
    }),
    resolve: ({ gameState, controller }, target, modeId) => {
      const opponent = getOpponent(controller);

      if (modeId === "trash-hand") {
        const { gameState: discardedState, card } = moveFirstHandCardToTrash(gameState, opponent);

        if (!card) {
          return withLog(gameState, `${getPlayerLabel(opponent)} nao tinha cartas na mao para descartar.`);
        }

        return withLog(
          discardedState,
          `${getPlayerLabel(opponent)} descartou ${card.name} da mao por Perona.`,
        );
      }

      if (!target) {
        return withLog(gameState, `${getPlayerLabel(controller)} nao escolheu alvo para Perona.`);
      }

      const targetCard = getCardByRef(gameState, target);

      if (!targetCard) {
        return withLog(gameState, "O alvo de Perona nao existe mais.");
      }

      return withLog(
        applyCostModifier(gameState, target, -3),
        `${getPlayerLabel(controller)} reduziu o custo de ${targetCard.name} em 3 com Perona.`,
      );
    },
  },
];
