import type { CardInstance } from "./types";

export function getAttachedDonPower(card: CardInstance): number {
  return card.attachedDon.length * 1000;
}

export function getEffectivePower(card: CardInstance, ownerIsTurnPlayer: boolean): number {
  if (card.power === undefined) {
    return 0;
  }

  const modifiedPower = Math.max(0, card.power + card.tempPowerModifier);

  if (!ownerIsTurnPlayer) {
    return modifiedPower;
  }

  return modifiedPower + getAttachedDonPower(card);
}

export function getEffectiveCost(card: CardInstance): number {
  return Math.max(0, (card.cost ?? 0) + card.tempCostModifier);
}
