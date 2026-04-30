import { getEffectiveCost } from "../power";
import type { CardInstance, GameState, PlayerId, PlayerState } from "../types";
import type { CardRef } from "./effectTypes";

export function getOpponent(player: PlayerId): PlayerId {
  return player === "player" ? "opponent" : "player";
}

export function getPlayerLabel(player: PlayerId) {
  return player === "player" ? "Jogador" : "Oponente";
}

export function withLog(gameState: GameState, message: string): GameState {
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

export function cardRefEquals(first: CardRef, second: CardRef): boolean {
  if (first.zone !== second.zone || first.player !== second.player) {
    return false;
  }

  if (first.zone === "character" && second.zone === "character") {
    return first.slotIndex === second.slotIndex;
  }

  if (first.zone === "trash" && second.zone === "trash") {
    return first.cardInstanceId === second.cardInstanceId;
  }

  return true;
}

export function getCardByRef(gameState: GameState, ref: CardRef): CardInstance | undefined {
  const playerState = gameState.players[ref.player];

  if (ref.zone === "leader") {
    return playerState.leader;
  }

  if (ref.zone === "stage") {
    return playerState.stage ?? undefined;
  }

  if (ref.zone === "trash") {
    return playerState.trash.find((card) => card.instanceId === ref.cardInstanceId);
  }

  return playerState.characterArea[ref.slotIndex] ?? undefined;
}

export function updateCardByRef(
  gameState: GameState,
  ref: CardRef,
  updater: (card: CardInstance) => CardInstance,
): GameState {
  const playerState = gameState.players[ref.player];

  if (ref.zone === "leader") {
    return updatePlayer(gameState, ref.player, {
      ...playerState,
      leader: updater(playerState.leader),
    });
  }

  if (ref.zone === "stage") {
    return updatePlayer(gameState, ref.player, {
      ...playerState,
      stage: playerState.stage ? updater(playerState.stage) : null,
    });
  }

  if (ref.zone === "trash") {
    const trash = playerState.trash.map((card) => (card.instanceId === ref.cardInstanceId ? updater(card) : card));
    return updatePlayer(gameState, ref.player, {
      ...playerState,
      trash,
    });
  }

  const character = playerState.characterArea[ref.slotIndex];

  if (!character) {
    return gameState;
  }

  const characterArea = [...playerState.characterArea];
  characterArea[ref.slotIndex] = updater(character);

  return updatePlayer(gameState, ref.player, {
    ...playerState,
    characterArea,
  });
}

export function getCharacters(
  gameState: GameState,
  player: PlayerId,
): { ref: CardRef; card: CardInstance }[] {
  return gameState.players[player].characterArea.flatMap((card, slotIndex) =>
    card ? [{ ref: { zone: "character", player, slotIndex } as CardRef, card }] : [],
  );
}

export function getOpponentCharacters(
  gameState: GameState,
  controller: PlayerId,
): { ref: CardRef; card: CardInstance }[] {
  return getCharacters(gameState, getOpponent(controller));
}

export function applyCostModifier(gameState: GameState, targetRef: CardRef, amount: number): GameState {
  return updateCardByRef(gameState, targetRef, (card) => ({
    ...card,
    tempCostModifier: card.tempCostModifier + amount,
  }));
}

export function applyPowerModifier(gameState: GameState, targetRef: CardRef, amount: number): GameState {
  return updateCardByRef(gameState, targetRef, (card) => ({
    ...card,
    tempPowerModifier: card.tempPowerModifier + amount,
  }));
}

export function restCard(gameState: GameState, targetRef: CardRef): GameState {
  return updateCardByRef(gameState, targetRef, (card) => ({
    ...card,
    active: false,
  }));
}

function returnAttachedDonRested(card: CardInstance): CardInstance[] {
  return card.attachedDon.map((don) => ({
    ...don,
    active: false,
    faceUp: true,
    attachedDon: [],
    attachedDonIds: [],
    tempCostModifier: 0,
    tempPowerModifier: 0,
  }));
}

function sendCharacterToTrash(card: CardInstance): CardInstance {
  return {
    ...card,
    active: true,
    attachedDon: [],
    attachedDonIds: [],
    tempCostModifier: 0,
    tempPowerModifier: 0,
  };
}

export function koCharacter(gameState: GameState, targetRef: CardRef): GameState {
  if (targetRef.zone !== "character") {
    return gameState;
  }

  const playerState = gameState.players[targetRef.player];
  const knockedOutCharacter = playerState.characterArea[targetRef.slotIndex];

  if (!knockedOutCharacter) {
    return gameState;
  }

  const characterArea = [...playerState.characterArea];
  characterArea[targetRef.slotIndex] = null;

  return updatePlayer(gameState, targetRef.player, {
    ...playerState,
    characterArea,
    costArea: [...playerState.costArea, ...returnAttachedDonRested(knockedOutCharacter)],
    trash: [sendCharacterToTrash(knockedOutCharacter), ...playerState.trash],
  });
}

function clearCardTemporaryModifiers(card: CardInstance): CardInstance {
  return {
    ...card,
    tempCostModifier: 0,
    tempPowerModifier: 0,
    attachedDon: card.attachedDon.map(clearCardTemporaryModifiers),
  };
}

function clearPlayerTemporaryModifiers(playerState: PlayerState): PlayerState {
  return {
    ...playerState,
    leader: clearCardTemporaryModifiers(playerState.leader),
    characterArea: playerState.characterArea.map((card) => (card ? clearCardTemporaryModifiers(card) : null)),
    stage: playerState.stage ? clearCardTemporaryModifiers(playerState.stage) : null,
    costArea: playerState.costArea.map(clearCardTemporaryModifiers),
  };
}

export function clearTemporaryModifiers(gameState: GameState): GameState {
  return {
    ...gameState,
    players: {
      player: clearPlayerTemporaryModifiers(gameState.players.player),
      opponent: clearPlayerTemporaryModifiers(gameState.players.opponent),
    },
  };
}

export function getCharacterTargetsByEffectiveCost(
  gameState: GameState,
  player: PlayerId,
  maxCost: number,
  options: { restedOnly?: boolean } = {},
) {
  return getCharacters(gameState, player).filter(({ card }) => {
    if (options.restedOnly && card.active) {
      return false;
    }

    return getEffectiveCost(card) <= maxCost;
  });
}

export function getOncePerTurnKey(source: CardInstance, handlerId: string): string {
  return `${source.instanceId}:${handlerId}`;
}
