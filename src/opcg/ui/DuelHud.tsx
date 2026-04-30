import type { GameState, Phase, PlayerId } from "../engine/types";

type DuelHudProps = {
  controlledPlayer: PlayerId;
  gameState: GameState;
  onAdvancePhase: () => void;
  onActivateLifeTrigger: () => void;
  onAddTriggerToHand: () => void;
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
  controlledPlayer,
  gameState,
  onActivateLifeTrigger,
  onAddTriggerToHand,
  onAdvancePhase,
  onPassBlock,
  onPassCounter,
  onResolveBattle,
}: DuelHudProps) {
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
      <button
        className="advance-button"
        disabled={gameState.phase === "gameOver" || Boolean(gameState.pendingLifeTrigger)}
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
