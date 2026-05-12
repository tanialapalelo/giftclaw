import { useCallback, useEffect, useReducer, useRef } from "react";
import type { GiftSuggestion } from "@/types";

export type GamePhase =
  | "idle"
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

export const CHUTE_OFFSET = 11;

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
      return { ...state, clawX: Math.min(95, state.clawX + CLAW_STEP) };
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

  const statePhaseRef = useRef(state.phase);
  statePhaseRef.current = state.phase;

  useEffect(() => {
    if (statePhaseRef.current === "moving") {
      dispatch({ type: "RESET", startX });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gifts]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const grab = useCallback(
    (explicitIndex?: number, exactX?: number) => {
      if (state.phase !== "moving") return;

      let nearestIndex: number;
      if (explicitIndex !== undefined) {
        nearestIndex = Math.min(gifts.length - 1, Math.max(0, explicitIndex));
      } else {
        const zoneWidth = 100 - CHUTE_OFFSET;
        const prizeWidth = zoneWidth / gifts.length;
        nearestIndex = Math.min(
          gifts.length - 1,
          Math.max(0, Math.floor((state.clawX - CHUTE_OFFSET) / prizeWidth))
        );
      }

      // Use exactX (actual visual box position) if provided,
      // otherwise fall back to mathematical column centre.
      const prizeX =
        exactX !== undefined ? exactX : getPrizeX(nearestIndex, gifts.length);

      dispatch({ type: "DROP", targetX: prizeX, prizeIndex: nearestIndex });
      clearTimeouts();
      timeoutsRef.current = [
        setTimeout(() => dispatch({ type: "GRAB" }), 700),
        setTimeout(() => dispatch({ type: "LIFT" }), 1100),
        setTimeout(() => dispatch({ type: "SHOW_RESULT" }), 1900),
      ];
    },
    [state.phase, state.clawX, gifts.length]
  );

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
