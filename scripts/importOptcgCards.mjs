import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const endpoints = [
  "https://optcgapi.com/api/allSetCards/",
  "https://optcgapi.com/api/allSTCards/",
  "https://optcgapi.com/api/allPromoCards/",
];

const keywordMarkers = ["Blocker", "Rush", "Banish", "Double Attack"];
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cardsJsonPath = resolve(rootDir, "src/opcg/data/generated/cards.json");

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function normalizeType(value) {
  const type = normalizeText(value).toLowerCase();

  if (type === "leader" || type === "character" || type === "event" || type === "stage" || type === "don") {
    return type;
  }

  throw new Error(`Unsupported card type from OPTCG API: ${String(value)}`);
}

function normalizeName(name, cardId) {
  return name
    .replace(new RegExp(`\\s*\\(${cardId.slice(-3)}\\)`, "i"), "")
    .replace(/\s*\((alternate art|parallel|reprint|jolly roger foil|full art|dash pack|spr|sp|tr)\)/gi, "")
    .trim();
}

function normalizeColors(value) {
  if (Array.isArray(value)) {
    return value.map((color) => normalizeText(color)).filter(Boolean);
  }

  return normalizeText(value)
    .split(/\s+/)
    .map((color) => color.trim())
    .filter(Boolean);
}

function normalizeTraits(value) {
  if (Array.isArray(value)) {
    return value.map((trait) => normalizeText(trait)).filter(Boolean);
  }

  return normalizeText(value)
    .split(/\s{2,}|\/|,/)
    .map((trait) => trait.trim())
    .filter(Boolean);
}

function inferTriggerText(effect) {
  const triggerIndex = effect.toLowerCase().indexOf("[trigger]");
  return triggerIndex >= 0 ? effect.slice(triggerIndex).trim() : undefined;
}

function inferKeywords(effect) {
  return keywordMarkers.filter((keyword) => effect.toLowerCase().includes(`[${keyword.toLowerCase()}]`));
}

function normalizeCard(rawCard) {
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

function getCardsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  throw new Error("Unexpected OPTCG API response shape.");
}

function shouldPreferCandidate(current, candidate) {
  if (!current) {
    return true;
  }

  const candidateLooksBase = candidate.imageUrl?.includes(`${candidate.cardId}.jpg`) ?? false;
  const currentLooksBase = current.imageUrl?.includes(`${current.cardId}.jpg`) ?? false;

  if (candidateLooksBase !== currentLooksBase) {
    return candidateLooksBase;
  }

  const candidateIsNotAlt = !/\b(alternate art|parallel|reprint|jolly roger foil|full art|dash pack|spr|sp|tr)\b/i.test(candidate.name);
  const currentIsNotAlt = !/\b(alternate art|parallel|reprint|jolly roger foil|full art|dash pack|spr|sp|tr)\b/i.test(current.name);

  if (candidateIsNotAlt !== currentIsNotAlt) {
    return candidateIsNotAlt;
  }

  return false;
}

async function fetchEndpoint(url) {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Skipping unavailable endpoint ${url}: 404 Not Found`);
      return [];
    }

    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return getCardsFromResponse(await response.json());
}

async function main() {
  const cardsById = new Map();

  for (const endpoint of endpoints) {
    console.log(`Fetching ${endpoint}`);
    const rawCards = await fetchEndpoint(endpoint);

    for (const rawCard of rawCards) {
      const normalized = normalizeCard(rawCard);
      const current = cardsById.get(normalized.cardId);

      if (shouldPreferCandidate(current, normalized)) {
        cardsById.set(normalized.cardId, normalized);
      }
    }
  }

  const cards = [...cardsById.values()].sort((first, second) => first.cardId.localeCompare(second.cardId));

  await mkdir(dirname(cardsJsonPath), { recursive: true });
  await writeFile(cardsJsonPath, `${JSON.stringify(cards, null, 2)}\n`, "utf8");

  console.log(`Wrote ${cards.length} cards to ${cardsJsonPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
