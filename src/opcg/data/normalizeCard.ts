import type { CardType } from "../engine/types";
import type { NormalizedCardData } from "./cardDatabaseTypes";

type RawOptcgCard = Record<string, unknown>;

const keywordMarkers = [
  "Blocker",
  "Rush",
  "Banish",
  "Double Attack",
] as const;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function normalizeType(value: unknown): CardType {
  const type = normalizeText(value).toLowerCase();

  if (type === "leader" || type === "character" || type === "event" || type === "stage" || type === "don") {
    return type;
  }

  throw new Error(`Unsupported card type from OPTCG API: ${String(value)}`);
}

function normalizeName(name: string, cardId: string): string {
  return name
    .replace(new RegExp(`\\s*\\(${cardId.slice(-3)}\\)`, "i"), "")
    .replace(/\s*\((alternate art|parallel|reprint|jolly roger foil|full art|dash pack|spr|sp|tr)\)/gi, "")
    .trim();
}

function normalizeColors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((color) => normalizeText(color)).filter(Boolean);
  }

  return normalizeText(value)
    .split(/\s+/)
    .map((color) => color.trim())
    .filter(Boolean);
}

function normalizeTraits(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((trait) => normalizeText(trait)).filter(Boolean);
  }

  return normalizeText(value)
    .split(/\s{2,}|\/|,/)
    .map((trait) => trait.trim())
    .filter(Boolean);
}

function inferTriggerText(effect: string): string | undefined {
  const triggerIndex = effect.toLowerCase().indexOf("[trigger]");

  if (triggerIndex < 0) {
    return undefined;
  }

  return effect.slice(triggerIndex).trim();
}

function inferKeywords(effect: string): string[] {
  return keywordMarkers.filter((keyword) => effect.toLowerCase().includes(`[${keyword.toLowerCase()}]`));
}

export function normalizeCard(rawCard: RawOptcgCard): NormalizedCardData {
  const cardId = normalizeText(rawCard.card_set_id ?? rawCard.cardId ?? rawCard.id);
  const effect = normalizeText(rawCard.card_text ?? rawCard.effect);

  if (!cardId) {
    throw new Error("OPTCG card is missing card_set_id.");
  }

  return {
    cardId,
    name: normalizeName(normalizeText(rawCard.card_name ?? rawCard.name), cardId),
    type: normalizeType(rawCard.card_type ?? rawCard.type),
    colors: normalizeColors(rawCard.card_color ?? rawCard.colors),
    cost: normalizeNumber(rawCard.card_cost ?? rawCard.cost),
    power: normalizeNumber(rawCard.card_power ?? rawCard.power),
    counter: normalizeNumber(rawCard.counter_amount ?? rawCard.counter),
    life: normalizeNumber(rawCard.life),
    traits: normalizeTraits(rawCard.sub_types ?? rawCard.traits),
    effect,
    triggerText: normalizeText(rawCard.triggerText) || inferTriggerText(effect),
    keywords: inferKeywords(effect),
    rarity: normalizeText(rawCard.rarity) || undefined,
    set: normalizeText(rawCard.set_id ?? rawCard.set_name ?? rawCard.set) || undefined,
    imageUrl: normalizeText(rawCard.card_image ?? rawCard.imageUrl) || undefined,
  };
}
