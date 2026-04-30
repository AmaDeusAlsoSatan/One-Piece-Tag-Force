import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ptBrCardText } from "../data/translations/ptBrCardText";
import type { CardInstance, CardType } from "../engine/types";

type CardInspectorProps = {
  card?: CardInstance;
};

const typeLabels: Record<CardType, string> = {
  leader: "Lider",
  character: "Personagem",
  event: "Evento",
  stage: "Cenario",
  don: "DON!!",
};

const traitLabels: Record<string, string> = {
  "Former Rumbar Pirates": "Ex-Piratas Rumbar",
  "Former Whitebeard Pirates": "Ex-Piratas do Barba Branca",
  "Land of Wano": "Pais de Wano",
  "Kouzuki Clan": "Cla Kozuki",
  "The Seven Warlords of the Sea": "Os Sete Corsarios",
  "Thriller Bark Pirates": "Piratas de Thriller Bark",
  "Donquixote Pirates": "Piratas Donquixote",
  "Drake Pirates": "Piratas Drake",
  "Straw Hat Crew": "Chapeus de Palha",
  "Navy": "Marinha",
};

const keywordLabels: Record<string, string> = {
  Blocker: "Bloqueador",
  Rush: "Impeto",
  Banish: "Banimento",
  "Double Attack": "Ataque Duplo",
};

function translateType(type: CardType) {
  return typeLabels[type] ?? type;
}

function translateTrait(trait: string) {
  return traitLabels[trait] ?? trait;
}

function translateKeyword(keyword: string) {
  return keywordLabels[keyword] ?? keyword;
}

function StatBadge({ children }: { children: ReactNode }) {
  return <span className="inspector-badge">{children}</span>;
}

export function CardInspector({ card }: CardInspectorProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [card?.imageUrl]);

  if (!card) {
    return (
      <aside className="card-inspector empty-inspector">
        <span className="inspector-kicker">Card Inspector</span>
        <strong>Passe o mouse sobre uma carta</strong>
        <p>O painel fica na ultima carta revelada para voce poder rolar e ler o texto com calma.</p>
      </aside>
    );
  }

  const translation = ptBrCardText[card.cardId];
  const translatedName = translation?.name ?? card.name;
  const translatedTraits = translation?.traits ?? card.traits?.map(translateTrait) ?? [];
  const translatedKeywords = translation?.keywords ?? card.keywords?.map(translateKeyword) ?? [];
  const effect = translation?.effect ?? card.effect ?? "";
  const triggerText = translation?.triggerText ?? card.triggerText ?? "";
  const isMissingTranslation = !translation && Boolean(card.effect || card.triggerText);

  return (
    <aside className="card-inspector">
      <span className="inspector-kicker">Card Inspector</span>
      {card.imageUrl && !imageFailed ? (
        <img
          alt={translatedName}
          className="inspector-image"
          draggable={false}
          src={card.imageUrl}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="inspector-image-fallback">
          <strong>{translatedName}</strong>
        </div>
      )}

      <div className="inspector-title-block">
        <strong className="inspector-title">{translatedName}</strong>
        <span>{card.cardId}</span>
      </div>

      <div className="inspector-meta">
        <StatBadge>{translation?.typeLabel ?? translateType(card.type)}</StatBadge>
        {card.colors.map((color) => (
          <StatBadge key={color}>{color}</StatBadge>
        ))}
        {card.cost !== undefined && <StatBadge>Custo {card.cost}</StatBadge>}
        {card.power !== undefined && <StatBadge>Poder {card.power}</StatBadge>}
        {card.counter !== undefined && card.counter > 0 && <StatBadge>Counter +{card.counter}</StatBadge>}
        {card.life !== undefined && <StatBadge>Vida {card.life}</StatBadge>}
      </div>

      {translatedTraits.length > 0 && (
        <section className="inspector-section">
          <span>Traits</span>
          <p>{translatedTraits.join(" / ")}</p>
        </section>
      )}

      {translatedKeywords.length > 0 && (
        <section className="inspector-section">
          <span>Keywords</span>
          <p>{translatedKeywords.join(" / ")}</p>
        </section>
      )}

      {(effect || isMissingTranslation) && (
        <section className="inspector-section">
          <span>Efeito</span>
          {isMissingTranslation && <em className="translation-missing">Traducao ainda nao cadastrada.</em>}
          <p className="inspector-effect">{effect || "Sem texto de efeito."}</p>
        </section>
      )}

      {triggerText && (
        <section className="inspector-section trigger-inspector-section">
          <span>Trigger</span>
          <p className="inspector-effect">{triggerText}</p>
        </section>
      )}

      {translation?.notes && (
        <section className="inspector-section">
          <span>Notas</span>
          <p>{translation.notes}</p>
        </section>
      )}
    </aside>
  );
}
