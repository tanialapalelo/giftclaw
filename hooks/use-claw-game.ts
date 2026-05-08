import { useCallback, useEffect, useReducer, useRef } from "react";
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

// Prize area starts at x=11% (after the 36px chute in 320px wide container ≈ 11%)
// and spans to 100%. Prizes are arranged with justify-around inside that zone.
const CHUTE_OFFSET = 11; // percent — left boundary of prize zone

export function getPrizeX(index: number, total: number): number {
  const zoneWidth = 100 - CHUTE_OFFSET;
  return CHUTE_OFFSET + ((2 * index + 1) / (2 * total)) * zoneWidth;
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOVE_LEFT":
      if (state.phase !== "moving") return state;
      return {
        ...state,
        clawX: Math.max(CHUTE_OFFSET, state.clawX - CLAW_STEP),
      };
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
      // Claw lifts and swings back to the drop chute (left)
      return { ...state, phase: "lifting", clawY: 0, targetX: CHUTE_OFFSET };
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
  // Claw starts at the first prize position (left side of prize zone)
  const startX =
    gifts.length > 0 ? getPrizeX(0, gifts.length) : CHUTE_OFFSET + 10;

  const [state, dispatch] = useReducer(reducer, {
    phase: "moving",
    clawX: startX,
    clawY: 0,
    targetX: startX,
    grabbedPrize: null,
  });

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    dispatch({ type: "RESET", startX });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gifts]);

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const grab = useCallback(() => {
    if (state.phase !== "moving") return;

    const zoneWidth = 100 - CHUTE_OFFSET;
    const prizeWidth = zoneWidth / gifts.length;
    const nearestIndex = Math.min(
      gifts.length - 1,
      Math.max(0, Math.floor((state.clawX - CHUTE_OFFSET) / prizeWidth))
    );

    const prizeX = getPrizeX(nearestIndex, gifts.length);

    dispatch({ type: "DROP", targetX: prizeX, prizeIndex: nearestIndex });
    clearTimeouts();
    timeoutsRef.current = [
      setTimeout(() => dispatch({ type: "GRAB" }), 700),
      setTimeout(() => dispatch({ type: "LIFT" }), 1100),
      setTimeout(() => dispatch({ type: "SHOW_RESULT" }), 1900),
    ];
  }, [state.phase, state.clawX, gifts.length]);

  return {
    state,
    moveLeft: () => dispatch({ type: "MOVE_LEFT" }),
    moveRight: () => dispatch({ type: "MOVE_RIGHT" }),
    grab,
    reset: (newStartX?: number) => {
      clearTimeouts();
      dispatch({ type: "RESET", startX: newStartX ?? startX });
    },
  };
}
