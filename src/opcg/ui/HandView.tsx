import type { CardInstance } from "../engine/types";
import { CardView } from "./CardView";

type HandViewProps = {
  cards: CardInstance[];
  counterCandidateIds?: string[];
  playerLabel?: string;
  selectedCardId?: string;
  onCardClick: (card: CardInstance) => void;
  onCardHover?: (card?: CardInstance) => void;
  onCounterCardClick?: (card: CardInstance) => void;
};

export function HandView({
  cards,
  counterCandidateIds = [],
  playerLabel = "Jogador",
  selectedCardId,
  onCardClick,
  onCardHover,
  onCounterCardClick,
}: HandViewProps) {
  return (
    <section className="hand-view" aria-label="Mão do jogador">
      <div className="hand-label">Mão: {playerLabel}</div>
      <div className="hand-cards">
        {cards.map((card, index) => {
          const isCounterCandidate = counterCandidateIds.includes(card.instanceId);

          return (
            <div
              className="hand-card"
              key={card.instanceId}
              style={{ transform: `translateY(${Math.abs(index - 2) * 5}px) rotate(${(index - 2) * 4}deg)` }}
            >
              <CardView
                card={card}
                counterCandidate={isCounterCandidate}
                selected={card.instanceId === selectedCardId}
                onHover={onCardHover}
                onClick={isCounterCandidate && onCounterCardClick ? onCounterCardClick : onCardClick}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
