import type { CardInstance, GameState, PlayerId, PlayerState } from "./types";
import { getPlayerLabel } from "./validators";

function updatePlayers(
  gameState: GameState,
  player: PlayerId,
  playerState: PlayerState,
  opponent: PlayerId,
  opponentState: PlayerState,
): GameState {
  return {
    ...gameState,
    players: {
      ...gameState.players,
      [player]: playerState,
      [opponent]: opponentState,
    },
  };
}

function withLog(gameState: GameState, message: string): GameState {
  return {
    ...gameState,
    log: [message, ...gameState.log],
  };
}

function prepareDamagedLifeCard(card: CardInstance): CardInstance {
  return {
    ...card,
    active: true,
    faceUp: true,
    attachedDon: [],
    attachedDonIds: [],
  };
}

export function processNextLeaderDamage(gameState: GameState): GameState {
  const pendingDamage = gameState.pendingLeaderDamage;

  if (!pendingDamage || gameState.pendingLifeTrigger) {
    return gameState;
  }

  if (pendingDamage.remainingDamage <= 0) {
    return {
      ...gameState,
      pendingLeaderDamage: undefined,
    };
  }

  const { attackerPlayer, defenderPlayer, banish, initialLifeCount } = pendingDamage;
  const attackerState = gameState.players[attackerPlayer];
  const defenderState = gameState.players[defenderPlayer];

  if (defenderState.life.length === 0) {
    if (initialLifeCount > 0) {
      return withLog(
        {
          ...gameState,
          pendingLeaderDamage: undefined,
        },
        `${getPlayerLabel(defenderPlayer)} ficou sem Life, mas nao perdeu por dano multiplo ja em andamento.`,
      );
    }

    return {
      ...gameState,
      phase: "gameOver",
      winner: attackerPlayer,
      pendingLeaderDamage: undefined,
      log: [
        `${getPlayerLabel(attackerPlayer)} causou dano ao Leader sem Life e venceu o duelo.`,
        ...gameState.log,
      ],
    };
  }

  const [damagedLife, ...remainingLife] = defenderState.life;
  const revealedLifeCard = prepareDamagedLifeCard(damagedLife);
  const remainingDamage = pendingDamage.remainingDamage - 1;
  const nextPendingDamage = {
    ...pendingDamage,
    remainingDamage,
  };

  if (banish) {
    const damagedDefender: PlayerState = {
      ...defenderState,
      life: remainingLife,
      trash: [revealedLifeCard, ...defenderState.trash],
    };
    const damageState = updatePlayers(
      gameState,
      attackerPlayer,
      attackerState,
      defenderPlayer,
      damagedDefender,
    );
    const nextState = withLog(
      {
        ...damageState,
        pendingLeaderDamage: remainingDamage > 0 ? nextPendingDamage : undefined,
      },
      `${getPlayerLabel(attackerPlayer)} causou dano com Banish. ${damagedLife.name} foi enviada da Life para o Trash.`,
    );

    return remainingDamage > 0 ? processNextLeaderDamage(nextState) : nextState;
  }

  const damagedDefender: PlayerState = {
    ...defenderState,
    life: remainingLife,
    hand: damagedLife.trigger ? defenderState.hand : [...defenderState.hand, revealedLifeCard],
  };
  const damageState = updatePlayers(
    gameState,
    attackerPlayer,
    attackerState,
    defenderPlayer,
    damagedDefender,
  );

  if (damagedLife.trigger) {
    return withLog(
      {
        ...damageState,
        pendingLeaderDamage: nextPendingDamage,
        pendingLifeTrigger: {
          player: defenderPlayer,
          card: revealedLifeCard,
        },
      },
      `${getPlayerLabel(defenderPlayer)} revelou ${damagedLife.name} com Trigger.`,
    );
  }

  const nextState = withLog(
    {
      ...damageState,
      pendingLeaderDamage: remainingDamage > 0 ? nextPendingDamage : undefined,
    },
    `${getPlayerLabel(attackerPlayer)} causou 1 dano ao Leader de ${getPlayerLabel(defenderPlayer)}.`,
  );

  return remainingDamage > 0 ? processNextLeaderDamage(nextState) : nextState;
}
