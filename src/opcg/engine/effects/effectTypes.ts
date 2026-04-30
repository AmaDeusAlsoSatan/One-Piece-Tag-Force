import type { CardInstance, GameState, PlayerId } from "../types";

export type CardRef =
  | { zone: "leader"; player: PlayerId }
  | { zone: "character"; player: PlayerId; slotIndex: number }
  | { zone: "stage"; player: PlayerId }
  | { zone: "trash"; player: PlayerId; cardInstanceId: string };

export type EffectTiming =
  | "onPlay"
  | "activateMain"
  | "whenAttacking"
  | "eventMain"
  | "eventCounter"
  | "trigger";

export type EffectChoiceMode = {
  id: string;
  label: string;
};

export type PendingEffect = {
  effectId: string;
  source: CardRef;
  sourceCardId: string;
  sourceName: string;
  controller: PlayerId;
  timing: EffectTiming;
  prompt: string;
  modes?: EffectChoiceMode[];
  selectedModeId?: string;
  validTargets: CardRef[];
  optional: boolean;
};

export type EffectContext = {
  gameState: GameState;
  source: CardRef;
  sourceCard: CardInstance;
  controller: PlayerId;
  timing: EffectTiming;
  modeId?: string;
};

export type CardEffectHandler = {
  id: string;
  timing: EffectTiming;
  canActivate: (ctx: EffectContext) => boolean;
  createPendingEffect?: (ctx: EffectContext) => PendingEffect;
  resolve?: (ctx: EffectContext, target?: CardRef, modeId?: string) => GameState;
};
