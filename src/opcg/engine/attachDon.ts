import type { AttachDonTarget, CardInstance, GameState, PlayerId, PlayerState } from "./types";
import { getPlayerLabel, validateCanAttachDon } from "./validators";

function updatePlayer(gameState: GameState, player: PlayerId, playerState: PlayerState): GameState {
  return {
    ...gameState,
    players: {
      ...gameState.players,
      [player]: playerState,
    },
  };
}

function withLog(gameState: GameState, message: string): GameState {
  return {
    ...gameState,
    log: [message, ...gameState.log],
  };
}

function prepareAttachedDon(don: CardInstance): CardInstance {
  return {
    ...don,
    active: true,
    faceUp: true,
    attachedDon: [],
    attachedDonIds: [],
  };
}

export function attachDon(
  gameState: GameState,
  player: PlayerId,
  donInstanceId: string,
  target: AttachDonTarget,
): GameState {
  const validation = validateCanAttachDon(gameState, player, donInstanceId, target);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const playerState = gameState.players[player];
  const don = playerState.costArea.find((candidate) => candidate.instanceId === donInstanceId);

  if (!don) {
    return withLog(gameState, "Esse DON!! não está na Cost Area.");
  }

  const attachedDon = prepareAttachedDon(don);
  const updatedCostArea = playerState.costArea.filter((candidate) => candidate.instanceId !== donInstanceId);
  let targetName = playerState.leader.name;
  let updatedPlayer: PlayerState;

  if (target.type === "leader") {
    const leader = {
      ...playerState.leader,
      attachedDon: [...playerState.leader.attachedDon, attachedDon],
      attachedDonIds: [...playerState.leader.attachedDonIds, attachedDon.instanceId],
    };

    updatedPlayer = {
      ...playerState,
      leader,
      costArea: updatedCostArea,
    };
  } else {
    const characterArea = [...playerState.characterArea];
    const targetCharacter = characterArea[target.slotIndex];

    if (!targetCharacter) {
      return withLog(gameState, "Esse slot de Character está vazio.");
    }

    targetName = targetCharacter.name;
    characterArea[target.slotIndex] = {
      ...targetCharacter,
      attachedDon: [...targetCharacter.attachedDon, attachedDon],
      attachedDonIds: [...targetCharacter.attachedDonIds, attachedDon.instanceId],
    };

    updatedPlayer = {
      ...playerState,
      characterArea,
      costArea: updatedCostArea,
    };
  }

  return withLog(
    updatePlayer(gameState, player, updatedPlayer),
    `${getPlayerLabel(player)} deu 1 DON!! para ${targetName}.`,
  );
}
