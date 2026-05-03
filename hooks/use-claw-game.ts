import { useCallback, useReducer } from "react";
import type { GiftSuggestion } from "@/types";

export type GamePhase =
  | "moving"
  | "dropping"
  | "grabbing"
  | "lifting"
  | "result";

interface GameState {
  phase: GamePhase;
  clawX: number;
  clawY: number;
  targetX: number;
  grabbedPrize: number | null;
}

type GameAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "DROP"; targetX: number; prizeIndex: number }
  | { type: "GRAB" }
  | { type: "LIFT" }
  | { type: "SHOW_RESULT" }
  | { type: "RESET" };

const CLAW_STEP = 12;

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOVE_LEFT":
      if (state.phase !== "moving") return state;
      return { ...state, clawX: Math.max(8, state.clawX - CLAW_STEP) };
    case "MOVE_RIGHT":
      if (state.phase !== "moving") return state;
      return { ...state, clawX: Math.min(92, state.clawX + CLAW_STEP) };
    case "DROP":
      if (state.phase !== "moving") return state;
      return {
        ...state,
        phase: "dropping",
        clawY: 68,
        targetX: action.targetX,
        grabbedPrize: action.prizeIndex,
      };
    case "GRAB":
      return { ...state, phase: "grabbing" };
    case "LIFT":
      return { ...state, phase: "lifting", clawY: 0 };
    case "SHOW_RESULT":
      return { ...state, phase: "result" };
    case "RESET":
      return {
        phase: "moving",
        clawX: 50,
        clawY: 0,
        targetX: 50,
        grabbedPrize: null,
      };
    default:
      return state;
  }
}

export function useClawGame(gifts: GiftSuggestion[]) {
  const [state, dispatch] = useReducer(reducer, {
    phase: "moving",
    clawX: 50,
    clawY: 0,
    targetX: 50,
    grabbedPrize: null,
  });

  const grab = useCallback(() => {
    if (state.phase !== "moving") return;

    const prizeWidth = 100 / gifts.length;
    const nearestIndex = Math.min(
      gifts.length - 1,
      Math.max(0, Math.floor(state.clawX / prizeWidth))
    );

    const prizeX = ((2 * nearestIndex + 1) / (2 * gifts.length)) * 100;

    dispatch({ type: "DROP", targetX: prizeX, prizeIndex: nearestIndex });

    // Timeline:
    // 0ms    → claw turun + geser ke prize (700ms transition)
    // 700ms  → fingers tutup (GRAB)
    // 1100ms → claw naik sambil bawa prize (LIFT)
    // 1900ms → reveal
    setTimeout(() => dispatch({ type: "GRAB" }), 700);
    setTimeout(() => dispatch({ type: "LIFT" }), 1100);
    setTimeout(() => dispatch({ type: "SHOW_RESULT" }), 1900);
  }, [state.phase, state.clawX, gifts.length]);

  return {
    state,
    moveLeft: () => dispatch({ type: "MOVE_LEFT" }),
    moveRight: () => dispatch({ type: "MOVE_RIGHT" }),
    grab,
    reset: () => dispatch({ type: "RESET" }),
  };
}
