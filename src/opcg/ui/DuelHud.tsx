import type { GameState, Phase, PlayerId } from "../engine/types";

type DuelHudProps = {
  canActivateLeaderEffect?: boolean;
  controlledPlayer: PlayerId;
  gameState: GameState;
  onActivateLeaderEffect: () => void;
  onAdvancePhase: () => void;
  onActivateLifeTrigger: () => void;
  onAddTriggerToHand: () => void;
  onCancelEffect: () => void;
  onEffectModeSelect: (modeId: string) => void;
  onEffectNoTarget: () => void;
  onPassBlock: () => void;
  onPassCounter: () => void;
  onResolveBattle: () => void;
};

const phaseLabels: Record<Phase, string> = {
  refresh: "Refresh",
  draw: "Draw",
  don: "DON!!",
  main: "Main",
  end: "End",
  gameOver: "Game Over",
};

const playerLabels: Record<PlayerId, string> = {
  player: "Jogador",
  opponent: "Oponente",
};

const battleStepLabels = {
  block: "Block",
  counter: "Counter",
  damage: "Damage",
};

export function DuelHud({
  canActivateLeaderEffect = false,
  controlledPlayer,
  gameState,
  onActivateLeaderEffect,
  onActivateLifeTrigger,
  onAddTriggerToHand,
  onAdvancePhase,
  onCancelEffect,
  onEffectModeSelect,
  onEffectNoTarget,
  onPassBlock,
  onPassCounter,
  onResolveBattle,
}: DuelHudProps) {
  const pendingEffectNeedsMode = Boolean(
    gameState.pendingEffect?.modes?.length && !gameState.pendingEffect.selectedModeId,
  );

  return (
    <aside className="duel-hud">
      <div className="hud-panel">
        <span>Turno</span>
        <strong>{gameState.turnNumber}</strong>
      </div>
      <div className="hud-panel">
        <span>Fase</span>
        <strong>{phaseLabels[gameState.phase]}</strong>
      </div>
      <div className="hud-panel">
        <span>Jogador atual</span>
        <strong>{playerLabels[gameState.turnPlayer]}</strong>
      </div>
      <div className="hud-panel controlled-panel">
        <span>Controlando</span>
        <strong>{playerLabels[controlledPlayer]}</strong>
      </div>
      {gameState.phase === "gameOver" && gameState.winner && (
        <div className="hud-panel winner-panel">
          <span>Vencedor</span>
          <strong>{playerLabels[gameState.winner]}</strong>
        </div>
      )}
      {gameState.pendingLifeTrigger && (
        <section className="trigger-panel">
          <span>Trigger de Life</span>
          <strong>Carta revelada: {gameState.pendingLifeTrigger.card.name}</strong>
          <small>{gameState.pendingLifeTrigger.card.trigger?.label ?? "Trigger"}</small>
          <div className="trigger-actions">
            <button className="trigger-button" type="button" onClick={onAddTriggerToHand}>
              Adicionar à mão
            </button>
            <button className="trigger-button primary-trigger-button" type="button" onClick={onActivateLifeTrigger}>
              Ativar Trigger
            </button>
          </div>
        </section>
      )}
      {gameState.pendingLeaderDamage && gameState.pendingLeaderDamage.remainingDamage > 0 && (
        <div className="hud-panel">
          <span>Dano pendente</span>
          <strong>{gameState.pendingLeaderDamage.remainingDamage}</strong>
        </div>
      )}
      {gameState.pendingEffect && (
        <section className="pending-effect-panel">
          <span>Efeito pendente</span>
          <strong>{gameState.pendingEffect.sourceName}</strong>
          <small>{gameState.pendingEffect.prompt}</small>
          {pendingEffectNeedsMode && (
            <div className="effect-actions">
              {gameState.pendingEffect.modes?.map((mode) => (
                <button
                  className="effect-button"
                  key={mode.id}
                  type="button"
                  onClick={() => onEffectModeSelect(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
          {!pendingEffectNeedsMode && (
            <>
              <small>Alvos validos: {gameState.pendingEffect.validTargets.length}</small>
              {gameState.pendingEffect.optional && (
                <button className="effect-button" type="button" onClick={onEffectNoTarget}>
                  Nao escolher alvo
                </button>
              )}
            </>
          )}
          <button className="effect-button cancel-effect-button" type="button" onClick={onCancelEffect}>
            Cancelar
          </button>
        </section>
      )}
      {gameState.pendingBattle && (
        <section className="pending-battle-panel">
          <span>Batalha em andamento</span>
          <strong>Etapa: {battleStepLabels[gameState.pendingBattle.step]}</strong>
          <small>
            {gameState.pendingBattle.step === "block"
              ? "Defensor pode usar Blocker."
              : gameState.pendingBattle.step === "counter"
                ? `Counter Step. Bônus de Counter: +${gameState.pendingBattle.counterPowerBonus}.`
                : `Damage Step. Bônus de Counter: +${gameState.pendingBattle.counterPowerBonus}.`}
          </small>
          {gameState.pendingBattle.step === "block" ? (
            <button className="resolve-battle-button" type="button" onClick={onPassBlock}>
              Passar Block
            </button>
          ) : gameState.pendingBattle.step === "counter" ? (
            <button className="resolve-battle-button" type="button" onClick={onPassCounter}>
              Passar Counter
            </button>
          ) : (
            <button className="resolve-battle-button" type="button" onClick={onResolveBattle}>
              Resolver Batalha
            </button>
          )}
        </section>
      )}
      {canActivateLeaderEffect && (
        <button className="effect-activate-button" type="button" onClick={onActivateLeaderEffect}>
          Ativar efeito do Leader
        </button>
      )}
      <button
        className="advance-button"
        disabled={gameState.phase === "gameOver" || Boolean(gameState.pendingLifeTrigger || gameState.pendingEffect)}
        type="button"
        onClick={onAdvancePhase}
      >
        Avançar Fase
      </button>
      <section className="duel-log">
        <h2>Log</h2>
        <ol>
          {gameState.log.slice(0, 8).map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry}</li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
