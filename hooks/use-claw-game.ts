import { useCallback, useEffect, useReducer } from "react";
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
  | { type: "RESET"; startX: number };

const CLAW_STEP = 12;

// Hitung posisi X center prize ke-i dalam flex justify-around
// justify-around: gap | box | gap | box | gap
// center box ke-i = ((2*i + 1) / (2*n)) * 100
export function getPrizeX(index: number, total: number): number {
  return ((2 * index + 1) / (2 * total)) * 100;
}

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
        clawX: action.startX,
        clawY: 0,
        targetX: action.startX,
        grabbedPrize: null,
      };
    default:
      return state;
  }
}

export function useClawGame(gifts: GiftSuggestion[]) {
  const middleIndex = Math.floor(gifts.length / 2);
  const startX = gifts.length > 0 ? getPrizeX(middleIndex, gifts.length) : 50;

  const [state, dispatch] = useReducer(reducer, {
    phase: "moving",
    clawX: startX,
    clawY: 0,
    targetX: startX,
    grabbedPrize: null,
  });

  // Saat gifts berubah (reshuffle setelah Try Again),
  // reset posisi claw ke tengah susunan baru
  useEffect(() => {
    dispatch({ type: "RESET", startX });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gifts]);

  const grab = useCallback(() => {
    if (state.phase !== "moving") return;

    const prizeWidth = 100 / gifts.length;
    const nearestIndex = Math.min(
      gifts.length - 1,
      Math.max(0, Math.floor(state.clawX / prizeWidth))
    );

    const prizeX = getPrizeX(nearestIndex, gifts.length);

    dispatch({ type: "DROP", targetX: prizeX, prizeIndex: nearestIndex });
    setTimeout(() => dispatch({ type: "GRAB" }), 700);
    setTimeout(() => dispatch({ type: "LIFT" }), 1100);
    setTimeout(() => dispatch({ type: "SHOW_RESULT" }), 1900);
  }, [state.phase, state.clawX, gifts.length]);

  return {
    state,
    moveLeft: () => dispatch({ type: "MOVE_LEFT" }),
    moveRight: () => dispatch({ type: "MOVE_RIGHT" }),
    grab,
    reset: (newStartX?: number) =>
      dispatch({ type: "RESET", startX: newStartX ?? startX }),
  };
}
