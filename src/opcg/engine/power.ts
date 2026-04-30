import type { CardInstance } from "./types";

export function getAttachedDonPower(card: CardInstance): number {
  return card.attachedDon.length * 1000;
}

export function getEffectivePower(card: CardInstance, ownerIsTurnPlayer: boolean): number {
  if (card.power === undefined) {
    return 0;
  }

  if (!ownerIsTurnPlayer) {
    return card.power;
  }

  return card.power + getAttachedDonPower(card);
}
