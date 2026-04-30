import type { PlayerState } from "./types";
import { canPayCost } from "./validators";

export function payCost(playerState: PlayerState, cost = 0): PlayerState {
  if (cost <= 0) {
    return playerState;
  }

  if (!canPayCost(playerState, cost)) {
    throw new Error("DON!! ativo insuficiente para pagar o custo.");
  }

  let remainingCost = cost;

  return {
    ...playerState,
    costArea: playerState.costArea.map((don) => {
      if (!don.active || remainingCost <= 0) {
        return don;
      }

      remainingCost -= 1;
      return { ...don, active: false };
    }),
  };
}
