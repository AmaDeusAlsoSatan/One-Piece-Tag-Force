import type { AttackSource, AttackTarget, AttachDonTarget, PlayerId } from "./types";

export type GameAction =
  | { type: "ADVANCE_PHASE" }
  | { type: "ACTIVATE_LIFE_TRIGGER"; player: PlayerId }
  | { type: "ADD_TRIGGER_CARD_TO_HAND"; player: PlayerId }
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
