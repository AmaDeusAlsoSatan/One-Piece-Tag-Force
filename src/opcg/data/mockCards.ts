import type { CardInstance, CardType, PlayerId } from "../engine/types";

type MockCardDefinition = {
  cardId: string;
  name: string;
  type: CardType;
  cost?: number;
  power?: number;
  counter?: number;
  colors: string[];
  effect?: string;
  keywords?: string[];
  trigger?: CardInstance["trigger"];
  life?: number;
  imageUrl?: string;
};

export const mockLeaders: Record<PlayerId, MockCardDefinition> = {
  player: {
    cardId: "mock-leader-perona",
    name: "Perona",
    type: "leader",
    power: 5000,
    colors: ["Green", "Black"],
    life: 4,
  },
  opponent: {
    cardId: "mock-leader-rob-lucci",
    name: "Rob Lucci",
    type: "leader",
    power: 5000,
    colors: ["Black"],
    life: 5,
  },
};

export const mockMainDeckCards: MockCardDefinition[] = [
  {
    cardId: "mock-character-scout",
    name: "Academy Scout",
    type: "character",
    cost: 2,
    power: 3000,
    counter: 1000,
    colors: ["Green"],
    trigger: {
      label: "Trigger: efeito futuro ainda não implementado",
      kind: "placeholder",
    },
  },
  {
    cardId: "mock-character-agent",
    name: "Cipher Agent",
    type: "character",
    cost: 3,
    power: 5000,
    counter: 1000,
    colors: ["Black"],
  },
  {
    cardId: "mock-character-rusher",
    name: "Rushing Cadet",
    type: "character",
    cost: 3,
    power: 5000,
    counter: 1000,
    colors: ["Green"],
    keywords: ["Rush"],
  },
  {
    cardId: "mock-character-blocker",
    name: "Academy Guard",
    type: "character",
    cost: 2,
    power: 2000,
    counter: 1000,
    colors: ["Black"],
    keywords: ["Blocker"],
  },
  {
    cardId: "mock-character-banisher",
    name: "Silent Executioner",
    type: "character",
    cost: 4,
    power: 6000,
    counter: 1000,
    colors: ["Black"],
    keywords: ["Banish"],
  },
  {
    cardId: "mock-character-double-attacker",
    name: "Twin Strike Cadet",
    type: "character",
    cost: 5,
    power: 7000,
    counter: 0,
    colors: ["Green"],
    keywords: ["Double Attack"],
  },
  {
    cardId: "mock-character-swordsman",
    name: "Quiet Swordsman",
    type: "character",
    cost: 4,
    power: 6000,
    counter: 1000,
    colors: ["Green", "Black"],
  },
  {
    cardId: "mock-character-guardian",
    name: "Harbor Guardian",
    type: "character",
    cost: 5,
    power: 7000,
    counter: 0,
    colors: ["Black"],
  },
  {
    cardId: "mock-stage-training-room",
    name: "Training Room",
    type: "stage",
    cost: 2,
    colors: ["Green"],
  },
  {
    cardId: "mock-event-tactical-note",
    name: "Tactical Note",
    type: "event",
    cost: 1,
    counter: 2000,
    colors: ["Black"],
    trigger: {
      label: "Trigger: efeito ainda não implementado",
      kind: "placeholder",
    },
  },
  {
    cardId: "mock-event-surprise-lesson",
    name: "Surprise Lesson",
    type: "event",
    cost: 3,
    counter: 4000,
    colors: ["Green"],
  },
];

export const mockDonCard: MockCardDefinition = {
  cardId: "DON-don",
  name: "DON!! Card",
  type: "don",
  colors: [],
  effect: "Your Turn +1000",
  imageUrl: "https://optcgapi.com/media/static/Card_Images/DON_Card_-_One_Piece_Demo_Deck_Cards_OPDD_img.jpg",
};

export function createCardInstance(
  definition: MockCardDefinition,
  owner: PlayerId,
  instanceId: string,
  overrides: Partial<CardInstance> = {},
): CardInstance {
  return {
    instanceId,
    cardId: definition.cardId,
    name: definition.name,
    type: definition.type,
    owner,
    controller: owner,
    cost: definition.cost,
    power: definition.power,
    counter: definition.counter,
    colors: definition.colors,
    effect: definition.effect,
    imageUrl: definition.imageUrl,
    keywords: definition.keywords ?? [],
    trigger: definition.trigger,
    active: true,
    faceUp: true,
    attachedDonIds: [],
    attachedDon: [],
    life: definition.life,
    ...overrides,
  };
}
