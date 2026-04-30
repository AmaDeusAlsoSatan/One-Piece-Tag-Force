import { useEffect, useState } from "react";
import type { CardInstance } from "../engine/types";

type CardViewProps = {
  card?: CardInstance | null;
  compact?: boolean;
  effectivePower?: number;
  hidden?: boolean;
  selected?: boolean;
  selectedDon?: boolean;
  attachTarget?: boolean;
  attackerCandidate?: boolean;
  selectedAttacker?: boolean;
  attackTarget?: boolean;
  blockerCandidate?: boolean;
  counterCandidate?: boolean;
  onHover?: (card?: CardInstance) => void;
  onClick?: (card: CardInstance) => void;
};

function formatColors(colors: string[]) {
  return colors.length > 0 ? colors.join(" / ") : "Colorless";
}

function TextCardContent({
  attachedDonCount,
  card,
  compact,
  displayedPower,
}: {
  attachedDonCount: number;
  card: CardInstance;
  compact: boolean;
  displayedPower?: number;
}) {
  const keywords = card.keywords ?? [];

  return (
    <>
      <span className="card-type">{card.type}</span>
      <strong>{card.name}</strong>
      <span>{formatColors(card.colors)}</span>
      {!compact && keywords.length > 0 && <span className="card-keywords">{keywords.join(" / ")}</span>}
      <span className="card-stats">
        {card.cost !== undefined && <b>C {card.cost}</b>}
        {displayedPower !== undefined && <b>P {displayedPower}</b>}
        {card.counter !== undefined && card.counter > 0 && <b>+{card.counter}</b>}
        {attachedDonCount > 0 && <b>DON x{attachedDonCount}</b>}
        {card.trigger && <b className="trigger-badge">TRIGGER</b>}
      </span>
    </>
  );
}

export function CardView({
  card,
  compact = false,
  effectivePower,
  hidden = false,
  selected = false,
  selectedDon = false,
  attachTarget = false,
  attackerCandidate = false,
  selectedAttacker = false,
  attackTarget = false,
  blockerCandidate = false,
  counterCandidate = false,
  onHover,
  onClick,
}: CardViewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [card?.imageUrl]);

  if (!card) {
    return <div className={`card-view empty-card ${compact ? "compact-card" : ""}`} />;
  }

  const isFaceDown = hidden || !card.faceUp;
  const shouldShowImage = Boolean(card.imageUrl && !isFaceDown && !imageFailed);
  const className = [
    "card-view",
    compact ? "compact-card" : "",
    shouldShowImage ? "image-card" : "",
    card.active ? "active-card" : "rested-card",
    isFaceDown ? "card-back" : "",
    selected ? "selected-card" : "",
    selectedDon ? "selected-don" : "",
    attachTarget ? "attach-target" : "",
    attackerCandidate ? "attacker-candidate" : "",
    selectedAttacker ? "selected-attacker" : "",
    attackTarget ? "attack-target" : "",
    blockerCandidate ? "blocker-candidate" : "",
    counterCandidate ? "counter-candidate" : "",
  ].join(" ");
  const displayedPower = effectivePower ?? card.power;
  const attachedDonCount = card.attachedDon.length;
  const hoverHandlers = {
    onMouseEnter: () => onHover?.(isFaceDown ? undefined : card),
  };
  const content = isFaceDown ? (
    <span className="card-back-mark">OP</span>
  ) : shouldShowImage ? (
    <>
      <img
        alt={card.name}
        className="card-image"
        draggable={false}
        loading="lazy"
        src={card.imageUrl}
        onError={() => setImageFailed(true)}
      />
      {(attachedDonCount > 0 || effectivePower !== undefined || card.trigger) && (
        <span className="image-card-badges">
          {effectivePower !== undefined && <b>P {effectivePower}</b>}
          {attachedDonCount > 0 && <b>DON x{attachedDonCount}</b>}
          {card.trigger && <b className="trigger-badge">TRIGGER</b>}
        </span>
      )}
    </>
  ) : (
    <TextCardContent
      attachedDonCount={attachedDonCount}
      card={card}
      compact={compact}
      displayedPower={displayedPower}
    />
  );

  if (!onClick) {
    return (
      <div className={className} title={isFaceDown ? "Carta virada para baixo" : card.name} {...hoverHandlers}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick?.(card)}
      {...hoverHandlers}
      title={isFaceDown ? "Carta virada para baixo" : card.name}
    >
      {content}
    </button>
  );
}
