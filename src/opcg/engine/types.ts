import type { PendingEffect } from "./effects/effectTypes";

export type PlayerId = "player" | "opponent";

export type Phase = "refresh" | "draw" | "don" | "main" | "end" | "gameOver";

export type CardType = "leader" | "character" | "event" | "stage" | "don";

export type AttachDonTarget =
  | { type: "leader" }
  | { type: "character"; slotIndex: number };

export type AttackSource =
  | { type: "leader" }
  | { type: "character"; slotIndex: number };

export type AttackTarget =
  | { type: "leader" }
  | { type: "character"; slotIndex: number };

export type BattleStep = "block" | "counter" | "damage";

export type PendingBattle = {
  attackerPlayer: PlayerId;
  defenderPlayer: PlayerId;
  source: AttackSource;
  target: AttackTarget;
  step: BattleStep;
  attackerPowerAtDeclaration: number;
  targetPowerAtDeclaration: number;
  counterPowerBonus: number;
  counterCardsUsed: string[];
  blockerUsed: boolean;
};

export type TriggerDefinition = {
  label: string;
  kind: "placeholder";
};

export type PendingLifeTrigger = {
  player: PlayerId;
  card: CardInstance;
};

export type PendingLeaderDamage = {
  attackerPlayer: PlayerId;
  defenderPlayer: PlayerId;
  remainingDamage: number;
  banish: boolean;
  initialLifeCount: number;
};

export type CardInstance = {
  instanceId: string;
  cardId: string;
  name: string;
  type: CardType;
  owner: PlayerId;
  controller: PlayerId;
  cost?: number;
  power?: number;
  counter?: number;
  colors: string[];
  traits?: string[];
  effect?: string;
  triggerText?: string;
  rarity?: string;
  set?: string;
  imageUrl?: string;
  keywords?: string[];
  trigger?: TriggerDefinition;
  active: boolean;
  faceUp: boolean;
  attachedDonIds: string[];
  attachedDon: CardInstance[];
  tempCostModifier: number;
  tempPowerModifier: number;
  playedTurn?: number;
  life?: number;
};

export type PlayerState = {
  leader: CardInstance;
  deck: CardInstance[];
  hand: CardInstance[];
  life: CardInstance[];
  trash: CardInstance[];
  characterArea: (CardInstance | null)[];
  stage: CardInstance | null;
  costArea: CardInstance[];
  donDeck: CardInstance[];
};

export type GameState = {
  players: Record<PlayerId, PlayerState>;
  turnPlayer: PlayerId;
  firstPlayer: PlayerId;
  phase: Phase;
  turnNumber: number;
  log: string[];
  pendingBattle?: PendingBattle;
  pendingEffect?: PendingEffect;
  pendingLifeTrigger?: PendingLifeTrigger;
  pendingLeaderDamage?: PendingLeaderDamage;
  usedThisTurn: string[];
  winner?: PlayerId;
};
