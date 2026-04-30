import type { CardEffectHandler, PendingEffect } from "../effectTypes";
import {
  applyCostModifier,
  getCardByRef,
  getCharacterTargetsByEffectiveCost,
  getOncePerTurnKey,
  getOpponent,
  getOpponentCharacters,
  getPlayerLabel,
  restCard,
  withLog,
} from "../effectHelpers";

const peronaModes = [
  { id: "rest-cost-4", label: "Descansar Character custo 4 ou menos" },
  { id: "cost-minus-1", label: "Reduzir custo em -1" },
];

export const peronaLeaderEffects: CardEffectHandler[] = [
  {
    id: "OP06-021-leader-activate-main",
    timing: "activateMain",
    canActivate: ({ gameState, sourceCard, controller, source }) => {
      if (gameState.phase !== "main" || gameState.turnPlayer !== controller || source.zone !== "leader") {
        return false;
      }

      return !gameState.usedThisTurn.includes(getOncePerTurnKey(sourceCard, "OP06-021-leader-activate-main"));
    },
    createPendingEffect: ({ gameState, source, sourceCard, controller, modeId }): PendingEffect => {
      const validTargets =
        modeId === "rest-cost-4"
          ? getCharacterTargetsByEffectiveCost(gameState, getOpponent(controller), 4)
              .filter(({ card }) => card.active)
              .map(({ ref }) => ref)
          : modeId === "cost-minus-1"
            ? getOpponentCharacters(gameState, controller).map(({ ref }) => ref)
            : [];

      return {
        effectId: "OP06-021-leader-activate-main",
        source,
        sourceCardId: sourceCard.cardId,
        sourceName: sourceCard.name,
        controller,
        timing: "activateMain",
        prompt: modeId ? "Escolha um Character do oponente." : "Escolha um efeito de Perona.",
        modes: peronaModes,
        selectedModeId: modeId,
        validTargets,
        optional: true,
      };
    },
    resolve: ({ gameState, sourceCard, controller }, target, modeId) => {
      const oncePerTurnKey = getOncePerTurnKey(sourceCard, "OP06-021-leader-activate-main");
      const stateWithUsage = {
        ...gameState,
        usedThisTurn: [...gameState.usedThisTurn, oncePerTurnKey],
      };

      if (!target) {
        return withLog(stateWithUsage, `${getPlayerLabel(controller)} ativou Perona sem escolher alvo.`);
      }

      const targetCard = getCardByRef(stateWithUsage, target);

      if (!targetCard) {
        return withLog(stateWithUsage, "O alvo de Perona nao existe mais.");
      }

      if (modeId === "rest-cost-4") {
        return withLog(
          restCard(stateWithUsage, target),
          `${getPlayerLabel(controller)} usou Perona para descansar ${targetCard.name}.`,
        );
      }

      return withLog(
        applyCostModifier(stateWithUsage, target, -1),
        `${getPlayerLabel(controller)} usou Perona para reduzir o custo de ${targetCard.name} em 1.`,
      );
    },
  },
];
