import { dailyExercises } from "./exercises/daily";
import { rehabExercises } from "./exercises/rehab";
import { gymExercises } from "./exercises/gym";
import { dontItems } from "./exercises/donts";
import type { AnyExercise } from "@/types";

export { dailyExercises, rehabExercises, gymExercises, dontItems, dontItems as donts };

export const allExercises: AnyExercise[] = [
  ...dailyExercises,
  ...rehabExercises,
  ...Object.values(gymExercises).flat(),
];
