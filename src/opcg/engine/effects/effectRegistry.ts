import type { CardEffectHandler, EffectTiming } from "./effectTypes";
import { iceAgeEffects, tsuruEffects } from "./cardEffects/navyEffects";
import { peronaLeaderEffects } from "./cardEffects/peronaEffects";
import { ryumaEffects } from "./cardEffects/thrillerBarkEffects";

export const effectRegistry: Record<string, CardEffectHandler[]> = {
  "OP06-021": peronaLeaderEffects,
  "OP02-106": tsuruEffects,
  "OP02-117": iceAgeEffects,
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
