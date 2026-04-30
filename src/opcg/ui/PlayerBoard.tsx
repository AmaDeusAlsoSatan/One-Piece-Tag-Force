import { getEffectivePower } from "../engine/power";
import type { AttackSource, AttackTarget, AttachDonTarget, CardInstance, PlayerId, PlayerState } from "../engine/types";
import { BoardZone } from "./BoardZone";
import { CardView } from "./CardView";

type PlayerBoardProps = {
  playerId: PlayerId;
  playerState: PlayerState;
  isOpponent?: boolean;
  isTurnPlayer?: boolean;
  selectedDonId?: string;
  onAttachTargetClick?: (target: AttachDonTarget) => void;
  onAttackTargetClick?: (target: AttackTarget) => void;
  onAttackerClick?: (source: AttackSource) => void;
  onBlockerClick?: (slotIndex: number) => void;
  onCardHover?: (card?: CardInstance) => void;
  onCharacterSlotClick?: (slotIndex: number) => void;
  onCostDonClick?: (donInstanceId: string) => void;
  blockerCandidateSlotIndexes?: number[];
  selectedAttacker?: AttackSource;
};

const playerLabels: Record<PlayerId, string> = {
  player: "Jogador",
  opponent: "Oponente",
};

export function PlayerBoard({
  playerId,
  playerState,
  isOpponent = false,
  isTurnPlayer = false,
  selectedDonId,
  onAttachTargetClick,
  onAttackTargetClick,
  onAttackerClick,
  onBlockerClick,
  onCardHover,
  onCharacterSlotClick,
  onCostDonClick,
  blockerCandidateSlotIndexes = [],
  selectedAttacker,
}: PlayerBoardProps) {
  const canChooseAttachTarget = Boolean(selectedDonId && onAttachTargetClick);
  const canChooseAttackTarget = Boolean(onAttackTargetClick);
  const canChooseAttacker = Boolean(onAttackerClick);
  const canClickCostDon = Boolean(onCostDonClick);

  function isSelectedAttacker(source: AttackSource) {
    return (
      selectedAttacker?.type === source.type &&
      (source.type === "leader" ||
        (selectedAttacker?.type === "character" && selectedAttacker.slotIndex === source.slotIndex))
    );
  }

  function canBeAttacker(card: CardInstance | null | undefined) {
    return canChooseAttacker && Boolean(card?.active);
  }

  function isBlockerCandidate(slotIndex: number) {
    return blockerCandidateSlotIndexes.includes(slotIndex);
  }

  return (
    <section className={`player-board ${isOpponent ? "opponent-board" : "local-board"}`}>
      <header className="player-board-header">
        <span>{playerLabels[playerId]}</span>
      </header>

      <div className="board-row board-row-zones">
        <BoardZone title="Life" count={playerState.life.length}>
          <div className="pile-row">
            {playerState.life.slice(0, 5).map((card) => (
              <CardView key={card.instanceId} card={card} compact hidden onHover={onCardHover} />
            ))}
          </div>
        </BoardZone>

        <BoardZone title="Leader">
          <CardView
            attachTarget={canChooseAttachTarget}
            attackTarget={canChooseAttackTarget}
            attackerCandidate={canBeAttacker(playerState.leader)}
            card={playerState.leader}
            effectivePower={getEffectivePower(playerState.leader, isTurnPlayer)}
            selectedAttacker={isSelectedAttacker({ type: "leader" })}
            onHover={onCardHover}
            onClick={
              canChooseAttachTarget
                ? () => onAttachTargetClick?.({ type: "leader" })
                : canChooseAttackTarget
                  ? () => onAttackTargetClick?.({ type: "leader" })
                  : canBeAttacker(playerState.leader)
                    ? () => onAttackerClick?.({ type: "leader" })
                    : undefined
            }
          />
        </BoardZone>

        <BoardZone title="Stage">
          <CardView card={playerState.stage} onHover={onCardHover} />
        </BoardZone>

        <BoardZone title="Deck" count={playerState.deck.length}>
          <CardView card={playerState.deck[0]} compact hidden onHover={onCardHover} />
        </BoardZone>

        <BoardZone title="Trash" count={playerState.trash.length}>
          <CardView card={playerState.trash[0]} compact onHover={onCardHover} />
        </BoardZone>

        <BoardZone title="DON!! Deck" count={playerState.donDeck.length}>
          <CardView card={playerState.donDeck[0]} compact hidden onHover={onCardHover} />
        </BoardZone>
      </div>

      <BoardZone title="Character Area" className="wide-zone">
        <div className="character-slots">
          {playerState.characterArea.map((card, index) => {
            const slotContent = (
              <>
                <CardView
                  attachTarget={Boolean(canChooseAttachTarget && card)}
                  attackTarget={Boolean(canChooseAttackTarget && card && !card.active)}
                  attackerCandidate={canBeAttacker(card)}
                  blockerCandidate={isBlockerCandidate(index)}
                  card={card}
                  effectivePower={card ? getEffectivePower(card, isTurnPlayer) : undefined}
                  selectedAttacker={isSelectedAttacker({ type: "character", slotIndex: index })}
                  onHover={onCardHover}
                  onClick={
                    canChooseAttachTarget && card
                      ? () => onAttachTargetClick?.({ type: "character", slotIndex: index })
                      : canChooseAttackTarget && card && !card.active
                        ? () => onAttackTargetClick?.({ type: "character", slotIndex: index })
                        : isBlockerCandidate(index)
                          ? () => onBlockerClick?.(index)
                        : canBeAttacker(card)
                          ? () => onAttackerClick?.({ type: "character", slotIndex: index })
                          : undefined
                  }
                />
                <span>C{index + 1}</span>
              </>
            );

            if (onCharacterSlotClick && !card) {
              return (
                <button
                  className="slot-shell clickable-slot"
                  key={`${playerId}-character-${index}`}
                  onClick={() => onCharacterSlotClick(index)}
                  type="button"
                >
                  {slotContent}
                </button>
              );
            }

            return (
              <div className="slot-shell" key={`${playerId}-character-${index}`}>
                {slotContent}
              </div>
            );
          })}
        </div>
      </BoardZone>

      <BoardZone title="Cost Area" count={playerState.costArea.length} className="wide-zone">
        <div className="don-slots">
          {Array.from({ length: 10 }, (_, index) => {
            const don = playerState.costArea[index];
            const isClickableDon = canClickCostDon && Boolean(don?.active);

            return (
              <div className="don-slot" key={`${playerId}-don-slot-${index}`}>
                <CardView
                  card={don}
                  compact
                  selectedDon={don?.instanceId === selectedDonId}
                  onHover={onCardHover}
                  onClick={isClickableDon && don ? () => onCostDonClick?.(don.instanceId) : undefined}
                />
              </div>
            );
          })}
        </div>
      </BoardZone>
    </section>
  );
}
