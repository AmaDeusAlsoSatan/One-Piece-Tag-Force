import { useEffect, useMemo, useReducer, useState } from "react";
import type {
  AttackSource,
  AttackTarget,
  AttachDonTarget,
  CardInstance,
  GameState,
  PlayerId,
} from "../engine/types";
import { createInitialGameState } from "../engine/createInitialGameState";
import { gameReducer } from "../engine/gameReducer";
import { canPayCost } from "../engine/validators";
import { CardInspector } from "./CardInspector";
import { DuelHud } from "./DuelHud";
import { HandView } from "./HandView";
import { PlayerBoard } from "./PlayerBoard";

const playerLabels: Record<PlayerId, string> = {
  player: "Jogador",
  opponent: "Oponente",
};

function getOpponentPlayer(player: PlayerId): PlayerId {
  return player === "player" ? "opponent" : "player";
}

function getControlledPlayer(gameState: GameState): PlayerId {
  if (gameState.pendingLifeTrigger) {
    return gameState.pendingLifeTrigger.player;
  }

  if (
    gameState.pendingBattle &&
    (gameState.pendingBattle.step === "block" || gameState.pendingBattle.step === "counter")
  ) {
    return gameState.pendingBattle.defenderPlayer;
  }

  return gameState.turnPlayer;
}

export function BattleScreen() {
  const initialGameState = useMemo(() => createInitialGameState("player"), []);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string>();
  const [selectedDonId, setSelectedDonId] = useState<string>();
  const [selectedAttacker, setSelectedAttacker] = useState<AttackSource>();
  const [hoveredCard, setHoveredCard] = useState<CardInstance>();

  const controlledPlayer = getControlledPlayer(gameState);
  const controlledPlayerState = gameState.players[controlledPlayer];
  const selectedHandCard = controlledPlayerState.hand.find((card) => card.instanceId === selectedHandCardId);
  const attackTargetPlayer = getOpponentPlayer(controlledPlayer);

  useEffect(() => {
    setSelectedHandCardId(undefined);
    setSelectedDonId(undefined);
    setSelectedAttacker(undefined);
  }, [controlledPlayer, gameState.phase]);

  function getCounterCandidateIds(playerId: PlayerId) {
    if (
      gameState.pendingBattle?.step !== "counter" ||
      gameState.pendingBattle.defenderPlayer !== playerId
    ) {
      return [];
    }

    const playerState = gameState.players[playerId];

    return playerState.hand
      .filter((card) => {
        if ((card.counter ?? 0) <= 0) {
          return false;
        }

        if (card.type === "character") {
          return true;
        }

        if (card.type === "event") {
          return canPayCost(playerState, card.cost ?? 0);
        }

        return false;
      })
      .map((card) => card.instanceId);
  }

  function getBlockerCandidateSlotIndexes(playerId: PlayerId) {
    if (
      gameState.pendingBattle?.step !== "block" ||
      gameState.pendingBattle.defenderPlayer !== playerId
    ) {
      return [];
    }

    return gameState.players[playerId].characterArea.flatMap((card, slotIndex) =>
      card?.active && card.keywords?.includes("Blocker") ? [slotIndex] : [],
    );
  }

  function canUseMainPhaseActions(playerId: PlayerId) {
    return (
      controlledPlayer === playerId &&
      gameState.turnPlayer === playerId &&
      gameState.phase === "main" &&
      !gameState.pendingBattle
      && !gameState.pendingLifeTrigger
    );
  }

  function handleHandCardClick(card: CardInstance) {
    if (gameState.pendingBattle || gameState.pendingLifeTrigger) {
      return;
    }

    setSelectedDonId(undefined);
    setSelectedAttacker(undefined);

    if (card.type === "character") {
      setSelectedHandCardId((currentCardId) => (currentCardId === card.instanceId ? undefined : card.instanceId));
      return;
    }

    setSelectedHandCardId(undefined);
    dispatch({ type: "PLAY_CARD_FROM_HAND", player: controlledPlayer, cardInstanceId: card.instanceId });
  }

  function handleCharacterSlotClick(slotIndex: number) {
    if (!selectedHandCard || selectedHandCard.type !== "character") {
      return;
    }

    dispatch({
      type: "PLAY_CARD_FROM_HAND",
      player: controlledPlayer,
      cardInstanceId: selectedHandCard.instanceId,
      targetSlotIndex: slotIndex,
    });
    setSelectedHandCardId(undefined);
    setSelectedAttacker(undefined);
  }

  function handleCounterCardClick(card: CardInstance) {
    if (
      gameState.pendingBattle?.step !== "counter" ||
      gameState.pendingBattle.defenderPlayer !== controlledPlayer
    ) {
      return;
    }

    setSelectedHandCardId(undefined);
    setSelectedDonId(undefined);
    setSelectedAttacker(undefined);

    if (card.type === "character") {
      dispatch({
        type: "USE_CHARACTER_COUNTER",
        player: controlledPlayer,
        cardInstanceId: card.instanceId,
      });
      return;
    }

    if (card.type === "event") {
      dispatch({
        type: "USE_EVENT_COUNTER",
        player: controlledPlayer,
        cardInstanceId: card.instanceId,
      });
    }
  }

  function handleCostDonClick(donInstanceId: string) {
    if (!canUseMainPhaseActions(controlledPlayer)) {
      return;
    }

    setSelectedHandCardId(undefined);
    setSelectedAttacker(undefined);
    setSelectedDonId((currentDonId) => (currentDonId === donInstanceId ? undefined : donInstanceId));
  }

  function handleAttachTargetClick(target: AttachDonTarget) {
    if (!selectedDonId) {
      return;
    }

    dispatch({
      type: "ATTACH_DON",
      player: controlledPlayer,
      donInstanceId: selectedDonId,
      target,
    });
    setSelectedDonId(undefined);
    setSelectedAttacker(undefined);
  }

  function sameAttackSource(current: AttackSource | undefined, next: AttackSource) {
    return (
      current?.type === next.type &&
      (next.type === "leader" || (current?.type === "character" && current.slotIndex === next.slotIndex))
    );
  }

  function handleAttackerClick(source: AttackSource) {
    if (!canUseMainPhaseActions(controlledPlayer)) {
      return;
    }

    setSelectedHandCardId(undefined);
    setSelectedDonId(undefined);
    setSelectedAttacker((current) => (sameAttackSource(current, source) ? undefined : source));
  }

  function handleAttackTargetClick(target: AttackTarget) {
    if (!selectedAttacker) {
      return;
    }

    dispatch({
      type: "DECLARE_ATTACK",
      player: controlledPlayer,
      source: selectedAttacker,
      target,
    });
    setSelectedAttacker(undefined);
  }

  function handleBlockerClick(blockerSlotIndex: number) {
    setSelectedHandCardId(undefined);
    setSelectedDonId(undefined);
    setSelectedAttacker(undefined);
    dispatch({
      type: "USE_BLOCKER",
      player: controlledPlayer,
      blockerSlotIndex,
    });
  }

  function renderBoard(playerId: PlayerId, isOpponent = false) {
    const isControlledBoard = controlledPlayer === playerId;
    const isAttackTargetBoard = selectedAttacker && attackTargetPlayer === playerId;
    const canUseBoardMainActions = canUseMainPhaseActions(playerId);

    return (
      <PlayerBoard
        blockerCandidateSlotIndexes={getBlockerCandidateSlotIndexes(playerId)}
        isOpponent={isOpponent}
        isTurnPlayer={gameState.turnPlayer === playerId}
        onAttachTargetClick={isControlledBoard && selectedDonId ? handleAttachTargetClick : undefined}
        onAttackTargetClick={isAttackTargetBoard ? handleAttackTargetClick : undefined}
        onAttackerClick={
          isControlledBoard && canUseBoardMainActions && !selectedHandCard && !selectedDonId
            ? handleAttackerClick
            : undefined
        }
        onBlockerClick={isControlledBoard && gameState.pendingBattle?.step === "block" ? handleBlockerClick : undefined}
        onCardHover={setHoveredCard}
        onCharacterSlotClick={
          isControlledBoard && selectedHandCard?.type === "character" ? handleCharacterSlotClick : undefined
        }
        onCostDonClick={isControlledBoard && canUseBoardMainActions ? handleCostDonClick : undefined}
        playerId={playerId}
        playerState={gameState.players[playerId]}
        selectedAttacker={isControlledBoard ? selectedAttacker : undefined}
        selectedDonId={isControlledBoard ? selectedDonId : undefined}
      />
    );
  }

  return (
    <main className="battle-screen">
      <CardInspector card={hoveredCard} />
      <section className="battle-table">
        {renderBoard("opponent", true)}
        <div className="table-divider" />
        {renderBoard("player")}
        <HandView
          cards={controlledPlayerState.hand}
          counterCandidateIds={getCounterCandidateIds(controlledPlayer)}
          playerLabel={playerLabels[controlledPlayer]}
          selectedCardId={selectedHandCardId}
          onCardClick={handleHandCardClick}
          onCardHover={setHoveredCard}
          onCounterCardClick={handleCounterCardClick}
        />
      </section>
      <DuelHud
        controlledPlayer={controlledPlayer}
        gameState={gameState}
        onAdvancePhase={() => {
          setSelectedHandCardId(undefined);
          setSelectedDonId(undefined);
          setSelectedAttacker(undefined);
          dispatch({ type: "ADVANCE_PHASE" });
        }}
        onActivateLifeTrigger={() => {
          setSelectedHandCardId(undefined);
          setSelectedDonId(undefined);
          setSelectedAttacker(undefined);
          dispatch({
            type: "ACTIVATE_LIFE_TRIGGER",
            player: gameState.pendingLifeTrigger?.player ?? controlledPlayer,
          });
        }}
        onAddTriggerToHand={() => {
          setSelectedHandCardId(undefined);
          setSelectedDonId(undefined);
          setSelectedAttacker(undefined);
          dispatch({
            type: "ADD_TRIGGER_CARD_TO_HAND",
            player: gameState.pendingLifeTrigger?.player ?? controlledPlayer,
          });
        }}
        onPassBlock={() => {
          setSelectedHandCardId(undefined);
          setSelectedDonId(undefined);
          setSelectedAttacker(undefined);
          dispatch({
            type: "PASS_BLOCK",
            player: controlledPlayer,
          });
        }}
        onPassCounter={() => {
          setSelectedHandCardId(undefined);
          setSelectedDonId(undefined);
          setSelectedAttacker(undefined);
          dispatch({
            type: "PASS_COUNTER",
            player: controlledPlayer,
          });
        }}
        onResolveBattle={() => {
          setSelectedHandCardId(undefined);
          setSelectedDonId(undefined);
          setSelectedAttacker(undefined);
          dispatch({ type: "RESOLVE_PENDING_BATTLE" });
        }}
      />
    </main>
  );
}
