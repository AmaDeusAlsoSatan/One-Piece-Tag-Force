import { getEffectivePower } from "./power";
import { payCost } from "./payCost";
import { processNextLeaderDamage } from "./damageFlow";
import type { CardRef } from "./effects/effectTypes";
import { koCharacter } from "./effects/effectHelpers";
import { triggerCardEffects } from "./effects/resolvePendingEffect";
import type { AttackSource, AttackTarget, CardInstance, GameState, PlayerId, PlayerState } from "./types";
import {
  getOpponent,
  getPlayerLabel,
  validateCanAttack,
  validateCanPassBlock,
  validateCanPassCounter,
  validateCanUseCharacterCounter,
  validateCanUseEventCounter,
  validateCanUseBlocker,
} from "./validators";

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

function withLogs(gameState: GameState, messages: string[]): GameState {
  return {
    ...gameState,
    log: [...messages, ...gameState.log],
  };
}

function getAttackSource(playerState: PlayerState, source: AttackSource): CardInstance | undefined {
  return source.type === "leader" ? playerState.leader : (playerState.characterArea[source.slotIndex] ?? undefined);
}

function getAttackTarget(playerState: PlayerState, target: AttackTarget): CardInstance | undefined {
  return target.type === "leader" ? playerState.leader : (playerState.characterArea[target.slotIndex] ?? undefined);
}

function cardHasKeyword(card: CardInstance | undefined, keyword: string): boolean {
  return card?.keywords?.includes(keyword) ?? false;
}

function restAttacker(playerState: PlayerState, source: AttackSource): PlayerState {
  if (source.type === "leader") {
    return {
      ...playerState,
      leader: { ...playerState.leader, active: false },
    };
  }

  const characterArea = [...playerState.characterArea];
  const attacker = characterArea[source.slotIndex];

  if (attacker) {
    characterArea[source.slotIndex] = { ...attacker, active: false };
  }

  return {
    ...playerState,
    characterArea,
  };
}

function sendCounterCardToTrash(card: CardInstance): CardInstance {
  return {
    ...card,
    active: true,
    faceUp: true,
    attachedDon: [],
    attachedDonIds: [],
    tempCostModifier: 0,
    tempPowerModifier: 0,
  };
}

export function declareAttack(
  gameState: GameState,
  player: PlayerId,
  source: AttackSource,
  target: AttackTarget,
): GameState {
  const validation = validateCanAttack(gameState, player, source, target);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const opponent = getOpponent(player);
  const playerState = gameState.players[player];
  const opponentState = gameState.players[opponent];
  const attacker = getAttackSource(playerState, source);
  const targetCard = getAttackTarget(opponentState, target);

  if (!attacker || !targetCard) {
    return withLog(gameState, "Ataque inválido.");
  }

  const restedPlayer = restAttacker(playerState, source);
  const attackerPower = getEffectivePower(attacker, true);
  const targetPower = getEffectivePower(targetCard, false);

  const attackState = withLog(
    {
      ...updatePlayer(gameState, player, restedPlayer),
      pendingBattle: {
        attackerPlayer: player,
        defenderPlayer: opponent,
        source,
        target,
        step: "block",
        attackerPowerAtDeclaration: attackerPower,
        targetPowerAtDeclaration: targetPower,
        counterPowerBonus: 0,
        counterCardsUsed: [],
        blockerUsed: false,
      },
    },
    `${getPlayerLabel(player)} declarou ataque com ${attacker.name} em ${targetCard.name}.`,
  );

  const sourceRef: CardRef =
    source.type === "leader"
      ? { zone: "leader", player }
      : { zone: "character", player, slotIndex: source.slotIndex };

  return triggerCardEffects(attackState, sourceRef, player, "whenAttacking");
}

export function useBlocker(gameState: GameState, player: PlayerId, blockerSlotIndex: number): GameState {
  const validation = validateCanUseBlocker(gameState, player, blockerSlotIndex);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return withLog(gameState, "Não há batalha para bloquear.");
  }

  const playerState = gameState.players[player];
  const characterArea = [...playerState.characterArea];
  const blocker = characterArea[blockerSlotIndex];

  if (!blocker) {
    return withLog(gameState, "Esse slot de Blocker está vazio.");
  }

  characterArea[blockerSlotIndex] = {
    ...blocker,
    active: false,
  };

  const updatedPlayer: PlayerState = {
    ...playerState,
    characterArea,
  };

  return withLog(
    {
      ...updatePlayer(gameState, player, updatedPlayer),
      pendingBattle: {
        ...pendingBattle,
        target: { type: "character", slotIndex: blockerSlotIndex },
        step: "counter",
        targetPowerAtDeclaration: getEffectivePower(blocker, false),
        blockerUsed: true,
      },
    },
    `${getPlayerLabel(player)} usou ${blocker.name} como Blocker.`,
  );
}

export function passBlock(gameState: GameState, player: PlayerId): GameState {
  const validation = validateCanPassBlock(gameState, player);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  if (!gameState.pendingBattle) {
    return withLog(gameState, "Não há batalha para passar Block.");
  }

  return withLog(
    {
      ...gameState,
      pendingBattle: {
        ...gameState.pendingBattle,
        step: "counter",
      },
    },
    `${getPlayerLabel(player)} não usou Blocker.`,
  );
}

export function useCharacterCounter(gameState: GameState, player: PlayerId, cardInstanceId: string): GameState {
  const validation = validateCanUseCharacterCounter(gameState, player, cardInstanceId);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return withLog(gameState, "Não há batalha para usar Counter.");
  }

  const playerState = gameState.players[player];
  const counterCard = playerState.hand.find((card) => card.instanceId === cardInstanceId);

  if (!counterCard || !counterCard.counter) {
    return withLog(gameState, "Essa carta não pode ser usada como Counter.");
  }

  const updatedPlayer: PlayerState = {
    ...playerState,
    hand: playerState.hand.filter((card) => card.instanceId !== cardInstanceId),
    trash: [sendCounterCardToTrash(counterCard), ...playerState.trash],
  };

  return withLog(
    {
      ...updatePlayer(gameState, player, updatedPlayer),
      pendingBattle: {
        ...pendingBattle,
        counterPowerBonus: pendingBattle.counterPowerBonus + counterCard.counter,
        counterCardsUsed: [...pendingBattle.counterCardsUsed, counterCard.instanceId],
      },
    },
    `${getPlayerLabel(player)} usou ${counterCard.name} como Counter (+${counterCard.counter}).`,
  );
}

export function useEventCounter(gameState: GameState, player: PlayerId, cardInstanceId: string): GameState {
  const validation = validateCanUseEventCounter(gameState, player, cardInstanceId);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return withLog(gameState, "Não há batalha para usar Event Counter.");
  }

  const playerState = gameState.players[player];
  const eventCard = playerState.hand.find((card) => card.instanceId === cardInstanceId);

  if (!eventCard || !eventCard.counter) {
    return withLog(gameState, "Esse Event não pode ser usado como Counter.");
  }

  const paidPlayer = payCost(playerState, eventCard.cost ?? 0);
  const updatedPlayer: PlayerState = {
    ...paidPlayer,
    hand: paidPlayer.hand.filter((card) => card.instanceId !== cardInstanceId),
    trash: [sendCounterCardToTrash(eventCard), ...paidPlayer.trash],
  };

  return withLog(
    {
      ...updatePlayer(gameState, player, updatedPlayer),
      pendingBattle: {
        ...pendingBattle,
        counterPowerBonus: pendingBattle.counterPowerBonus + eventCard.counter,
        counterCardsUsed: [...pendingBattle.counterCardsUsed, eventCard.instanceId],
      },
    },
    `${getPlayerLabel(player)} usou ${eventCard.name} como Event Counter (+${eventCard.counter}).`,
  );
}

export function passCounter(gameState: GameState, player: PlayerId): GameState {
  const validation = validateCanPassCounter(gameState, player);

  if (!validation.valid) {
    return withLog(gameState, validation.message);
  }

  if (!gameState.pendingBattle) {
    return withLog(gameState, "Não há batalha para passar Counter.");
  }

  return withLog(
    {
      ...gameState,
      pendingBattle: {
        ...gameState.pendingBattle,
        step: "damage",
      },
    },
    `${getPlayerLabel(player)} passou Counter.`,
  );
}

export function resolvePendingBattle(gameState: GameState): GameState {
  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return withLog(gameState, "Não há batalha pendente para resolver.");
  }

  if (pendingBattle.step !== "damage") {
    return withLog(gameState, "Ainda há etapas pendentes antes do dano.");
  }

  const battleState = gameState;
  const battle = pendingBattle;

  const { attackerPlayer, defenderPlayer, target } = battle;
  const attackerPower = battle.attackerPowerAtDeclaration;
  const targetPower = battle.targetPowerAtDeclaration + battle.counterPowerBonus;
  const playerState = battleState.players[attackerPlayer];
  const opponentState = battleState.players[defenderPlayer];
  const attackerCard = getAttackSource(playerState, battle.source);
  const targetCard = getAttackTarget(opponentState, target);
  const gameStateWithoutBattle = { ...battleState, pendingBattle: undefined };

  if (attackerPower < targetPower) {
    return withLog(
      gameStateWithoutBattle,
      `${getPlayerLabel(attackerPlayer)} atacou ${targetCard?.name ?? "o alvo"}, mas o ataque falhou.`,
    );
  }

  if (target.type === "leader") {
    if (opponentState.life.length === 0) {
      return {
        ...gameStateWithoutBattle,
        phase: "gameOver",
        winner: attackerPlayer,
        log: [
          `${getPlayerLabel(attackerPlayer)} atacou o Leader sem Life e venceu o duelo.`,
          ...battleState.log,
        ],
      };
    }

    const hasDoubleAttack = cardHasKeyword(attackerCard, "Double Attack");
    const damageAmount = hasDoubleAttack ? 2 : 1;
    const pendingDamageState = withLog(
      {
        ...gameStateWithoutBattle,
        pendingLeaderDamage: {
          attackerPlayer,
          defenderPlayer,
          remainingDamage: damageAmount,
          banish: cardHasKeyword(attackerCard, "Banish"),
          initialLifeCount: opponentState.life.length,
        },
      },
      hasDoubleAttack
        ? `${getPlayerLabel(attackerPlayer)} acertou o Leader de ${getPlayerLabel(defenderPlayer)} com Double Attack.`
        : `${getPlayerLabel(attackerPlayer)} acertou o Leader de ${getPlayerLabel(defenderPlayer)}.`,
    );

    return processNextLeaderDamage(pendingDamageState);
  }

  const knockedOutCharacter = opponentState.characterArea[target.slotIndex];

  if (!knockedOutCharacter) {
    return withLog(gameStateWithoutBattle, "O alvo do ataque não existe mais.");
  }

  return withLog(
    koCharacter(gameStateWithoutBattle, {
      zone: "character",
      player: defenderPlayer,
      slotIndex: target.slotIndex,
    }),
    `${getPlayerLabel(attackerPlayer)} deu K.O. em ${knockedOutCharacter.name}.`,
  );
}
