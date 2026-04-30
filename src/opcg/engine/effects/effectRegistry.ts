import type { CardEffectHandler, EffectTiming } from "./effectTypes";
import {
  iceAgeEffects,
  tashigiEffects,
  tsuruEffects,
  utaEffects,
  xDrakeEffects,
} from "./cardEffects/navyEffects";
import {
  josephEffects,
  op03KakuEffects,
  op05RobLucciEffects,
  op07KakuEffects,
  robLucciLeaderEffects,
} from "./cardEffects/cpEffects";
import { peronaLeaderEffects } from "./cardEffects/peronaEffects";
import {
  brookEffects,
  peronaCharacterEffects,
  ryumaEffects,
} from "./cardEffects/thrillerBarkEffects";
import { izoEffects } from "./cardEffects/wanoEffects";

export const effectRegistry: Record<string, CardEffectHandler[]> = {
  "OP06-021": peronaLeaderEffects,
  "OP07-079": robLucciLeaderEffects,
  "OP01-033": izoEffects,
  "OP01-054": xDrakeEffects,
  "OP02-106": tsuruEffects,
  "OP02-117": iceAgeEffects,
  "ST06-006": tashigiEffects,
  "ST08-002": utaEffects,
  "OP03-080": op03KakuEffects,
  "OP07-080": op07KakuEffects,
  "OP05-093": op05RobLucciEffects,
  "OP07-092": josephEffects,
  "OP06-092": brookEffects,
  "OP06-093": peronaCharacterEffects,
  "OP06-036": ryumaEffects,
};

export function getCardEffectHandlers(cardId: string, timing?: EffectTiming): CardEffectHandler[] {
  const handlers = effectRegistry[cardId] ?? [];

  if (!timing) {
    return handlers;
  }

  return handlers.filter((handler) => handler.timing === timing);
}

export function hasCardEffect(cardId: string, timing: EffectTiming): boolean {
  return getCardEffectHandlers(cardId, timing).length > 0;
}
