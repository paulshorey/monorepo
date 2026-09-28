import { ALL_INTERVALS as DB_ALL_INTERVALS } from "@lib/db-trading/sql/strength/constants";
import type { StrengthInterval } from "../types/strength.js";

export const ALL_INTERVALS: StrengthInterval[] = [...DB_ALL_INTERVALS];
export const FORWARD_FILL_DEPTH = 5;
