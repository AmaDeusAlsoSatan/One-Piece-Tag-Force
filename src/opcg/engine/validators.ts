import type {
  AttackSource,
  AttackTarget,
  AttachDonTarget,
  CardInstance,
  GameState,
  PlayerId,
  PlayerState,
} from "./types";

export type ValidationResult =
  | { valid: true }
  | {
      valid: false;
      message: string;
    };

export function getPlayerLabel(player: PlayerId) {
  return player === "player" ? "Jogador" : "Oponente";
}

export function getOpponent(player: PlayerId): PlayerId {
  return player === "player" ? "opponent" : "player";
}

export function canPayCost(playerState: PlayerState, cost = 0) {
  return playerState.costArea.filter((don) => don.active).length >= cost;
}

export function findCardInHand(playerState: PlayerState, cardInstanceId: string): CardInstance | undefined {
  return playerState.hand.find((card) => card.instanceId === cardInstanceId);
}

export function validateMainPhaseAction(gameState: GameState, player: PlayerId): ValidationResult {
  if (gameState.phase !== "main") {
    return { valid: false, message: "Só é possível jogar cartas na Main Phase." };
  }

  if (gameState.turnPlayer !== player) {
    return { valid: false, message: "Apenas o jogador do turno pode jogar cartas." };
  }

  if (gameState.pendingBattle) {
    return { valid: false, message: "Resolva a batalha atual antes de continuar." };
  }

  return { valid: true };
}

export function validateCharacterSlot(playerState: PlayerState, slotIndex: number | undefined): ValidationResult {
  if (slotIndex === undefined) {
    return { valid: false, message: "Escolha um slot vazio para jogar esse Character." };
  }

  if (slotIndex < 0 || slotIndex >= playerState.characterArea.length) {
    return { valid: false, message: "Esse slot de Character não existe." };
  }

  if (playerState.characterArea[slotIndex]) {
    return { valid: false, message: "Esse slot de Character já está ocupado." };
  }

  return { valid: true };
}

export function validateCanAttachDon(
  gameState: GameState,
  player: PlayerId,
  donInstanceId: string,
  target: AttachDonTarget,
): ValidationResult {
  const phaseValidation = validateMainPhaseAction(gameState, player);

  if (!phaseValidation.valid) {
    return phaseValidation;
  }

  const playerState = gameState.players[player];
  const don = playerState.costArea.find((candidate) => candidate.instanceId === donInstanceId);

  if (!don) {
    return { valid: false, message: "Esse DON!! não está na Cost Area." };
  }

  if (!don.active) {
    return { valid: false, message: "Só é possível dar DON!! ativo." };
  }

  if (target.type === "leader") {
    return { valid: true };
  }

  if (target.slotIndex < 0 || target.slotIndex >= playerState.characterArea.length) {
    return { valid: false, message: "Esse slot de Character não existe." };
  }

  if (!playerState.characterArea[target.slotIndex]) {
    return { valid: false, message: "Esse slot de Character está vazio." };
  }

  return { valid: true };
}

function getAttackSource(playerState: PlayerState, source: AttackSource): CardInstance | undefined {
  return source.type === "leader" ? playerState.leader : (playerState.characterArea[source.slotIndex] ?? undefined);
}

function getAttackTarget(playerState: PlayerState, target: AttackTarget): CardInstance | undefined {
  return target.type === "leader" ? playerState.leader : (playerState.characterArea[target.slotIndex] ?? undefined);
}

function isPlayersFirstTurn(gameState: GameState, player: PlayerId): boolean {
  return (
    (gameState.turnNumber === 1 && player === gameState.firstPlayer) ||
    (gameState.turnNumber === 2 && player !== gameState.firstPlayer)
  );
}

export function validateCanAttack(
  gameState: GameState,
  player: PlayerId,
  source: AttackSource,
  target: AttackTarget,
): ValidationResult {
  if (gameState.pendingBattle) {
    return { valid: false, message: "Resolva a batalha atual antes de declarar outro ataque." };
  }

  const phaseValidation = validateMainPhaseAction(gameState, player);

  if (!phaseValidation.valid) {
    return phaseValidation;
  }

  if (isPlayersFirstTurn(gameState, player)) {
    return { valid: false, message: "Nenhum jogador pode atacar no seu primeiro turno." };
  }

  const playerState = gameState.players[player];
  const opponentState = gameState.players[getOpponent(player)];
  const attacker = getAttackSource(playerState, source);

  if (!attacker) {
    return { valid: false, message: "O atacante escolhido não existe." };
  }

  if (!attacker.active) {
    return { valid: false, message: "Só é possível atacar com Leader ou Character ativo." };
  }

  if (
    source.type === "character" &&
    attacker.playedTurn === gameState.turnNumber &&
    !attacker.keywords?.includes("Rush")
  ) {
    return { valid: false, message: "Esse Character foi jogado neste turno e não tem Rush." };
  }

  if (target.type === "leader") {
    return { valid: true };
  }

  if (target.slotIndex < 0 || target.slotIndex >= opponentState.characterArea.length) {
    return { valid: false, message: "Esse alvo de Character não existe." };
  }

  const targetCard = getAttackTarget(opponentState, target);

  if (!targetCard) {
    return { valid: false, message: "Esse slot de Character está vazio." };
  }

  if (targetCard.active) {
    return { valid: false, message: "Só é possível atacar Characters descansados." };
  }

  return { valid: true };
}

export function validateCanUseBlocker(
  gameState: GameState,
  player: PlayerId,
  blockerSlotIndex: number,
): ValidationResult {
  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return { valid: false, message: "Não há batalha para bloquear." };
  }

  if (pendingBattle.step !== "block") {
    return { valid: false, message: "A janela de Blocker já passou." };
  }

  if (player !== pendingBattle.defenderPlayer) {
    return { valid: false, message: "Apenas o defensor pode usar Blocker." };
  }

  if (pendingBattle.blockerUsed) {
    return { valid: false, message: "Blocker já foi usado nesta batalha." };
  }

  const playerState = gameState.players[player];

  if (blockerSlotIndex < 0 || blockerSlotIndex >= playerState.characterArea.length) {
    return { valid: false, message: "Esse slot de Blocker não existe." };
  }

  const blocker = playerState.characterArea[blockerSlotIndex];

  if (!blocker) {
    return { valid: false, message: "Esse slot de Blocker está vazio." };
  }

  if (!blocker.active) {
    return { valid: false, message: "Não é possível usar Blocker descansado." };
  }

  if (!blocker.keywords?.includes("Blocker")) {
    return { valid: false, message: `${blocker.name} não tem Blocker.` };
  }

  return { valid: true };
}

export function validateCanPassBlock(gameState: GameState, player: PlayerId): ValidationResult {
  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return { valid: false, message: "Não há batalha para passar Block." };
  }

  if (pendingBattle.step !== "block") {
    return { valid: false, message: "A janela de Blocker já passou." };
  }

  if (player !== pendingBattle.defenderPlayer) {
    return { valid: false, message: "Apenas o defensor pode passar Block." };
  }

  return { valid: true };
}

export function validateCanUseCharacterCounter(
  gameState: GameState,
  player: PlayerId,
  cardInstanceId: string,
): ValidationResult {
  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return { valid: false, message: "Não há batalha para usar Counter." };
  }

  if (pendingBattle.step !== "counter") {
    return { valid: false, message: "Counter só pode ser usado na Counter Step." };
  }

  if (player !== pendingBattle.defenderPlayer) {
    return { valid: false, message: "Apenas o defensor pode usar Counter." };
  }

  const card = findCardInHand(gameState.players[player], cardInstanceId);

  if (!card) {
    return { valid: false, message: "Essa carta não está na mão do defensor." };
  }

  if (card.type !== "character") {
    return { valid: false, message: "Por enquanto, apenas Character pode ser usado como Counter." };
  }

  if (!card.counter || card.counter <= 0) {
    return { valid: false, message: `${card.name} não tem valor de Counter.` };
  }

  return { valid: true };
}

export function validateCanUseEventCounter(
  gameState: GameState,
  player: PlayerId,
  cardInstanceId: string,
): ValidationResult {
  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return { valid: false, message: "Não há batalha para usar Event Counter." };
  }

  if (pendingBattle.step !== "counter") {
    return { valid: false, message: "Event Counter só pode ser usado na Counter Step." };
  }

  if (player !== pendingBattle.defenderPlayer) {
    return { valid: false, message: "Apenas o defensor pode usar Event Counter." };
  }

  const playerState = gameState.players[player];
  const card = findCardInHand(playerState, cardInstanceId);

  if (!card) {
    return { valid: false, message: "Essa carta não está na mão do defensor." };
  }

  if (card.type !== "event") {
    return { valid: false, message: "Essa carta não é um Event." };
  }

  if (!card.counter || card.counter <= 0) {
    return { valid: false, message: `${card.name} não tem valor de Counter.` };
  }

  if (!canPayCost(playerState, card.cost ?? 0)) {
    return {
      valid: false,
      message: `${getPlayerLabel(player)} não tem DON!! ativo suficiente para usar ${card.name} como Counter.`,
    };
  }

  return { valid: true };
}

export function validateCanPassCounter(gameState: GameState, player: PlayerId): ValidationResult {
  const pendingBattle = gameState.pendingBattle;

  if (!pendingBattle) {
    return { valid: false, message: "Não há batalha para passar Counter." };
  }

  if (pendingBattle.step !== "counter") {
    return { valid: false, message: "Counter só pode ser passado na Counter Step." };
  }

  if (player !== pendingBattle.defenderPlayer) {
    return { valid: false, message: "Apenas o defensor pode passar Counter." };
  }

  return { valid: true };
}

export function validatePendingLifeTriggerAction(gameState: GameState, player: PlayerId): ValidationResult {
  if (!gameState.pendingLifeTrigger) {
    return { valid: false, message: "Não há Trigger pendente para resolver." };
  }

  if (gameState.pendingLifeTrigger.player !== player) {
    return { valid: false, message: "Apenas o dono do Trigger pode resolver essa janela." };
  }

  return { valid: true };
}
