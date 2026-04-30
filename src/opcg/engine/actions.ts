import type { AttackSource, AttackTarget, AttachDonTarget, PlayerId } from "./types";
import type { CardRef, EffectTiming } from "./effects/effectTypes";

export type GameAction =
  | { type: "ADVANCE_PHASE" }
  | { type: "ACTIVATE_LIFE_TRIGGER"; player: PlayerId }
  | { type: "ADD_TRIGGER_CARD_TO_HAND"; player: PlayerId }
  | { type: "ACTIVATE_CARD_EFFECT"; player: PlayerId; source: CardRef; timing: EffectTiming; modeId?: string }
  | { type: "SELECT_EFFECT_TARGET"; player: PlayerId; target?: CardRef; modeId?: string }
  | { type: "CANCEL_PENDING_EFFECT"; player: PlayerId }
  | { type: "RESOLVE_PENDING_BATTLE" }
  | { type: "PASS_BLOCK"; player: PlayerId }
  | { type: "PASS_COUNTER"; player: PlayerId }
  | { type: "USE_BLOCKER"; player: PlayerId; blockerSlotIndex: number }
  | { type: "USE_CHARACTER_COUNTER"; player: PlayerId; cardInstanceId: string }
  | { type: "USE_EVENT_COUNTER"; player: PlayerId; cardInstanceId: string }
  | {
      type: "ATTACH_DON";
      player: PlayerId;
      donInstanceId: string;
      target: AttachDonTarget;
    }
  | {
      type: "DECLARE_ATTACK";
      player: PlayerId;
      source: AttackSource;
      target: AttackTarget;
    }
  | {
      type: "PLAY_CARD_FROM_HAND";
      player: PlayerId;
      cardInstanceId: string;
      targetSlotIndex?: number;
    };
