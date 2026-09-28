export {
  OLD_INTERVALS,
  NEW_INTERVALS,
  ALL_INTERVALS,
  FORWARD_FILL_DEPTH,
  isValidInterval,
  extractIntervalValues,
  type OldInterval,
  type NewInterval,
  type StrengthInterval,
  type IntervalValues,
  type PartialIntervalValues,
} from "../constants";

export { ALL_INTERVALS as STRENGTH_INTERVALS } from "../constants";

export {
  forwardFillInterval,
  forwardFillAllIntervals,
  getMissingIntervals,
  needsForwardFill,
  type StrengthRow,
} from "./forwardFill";

export { calculateAverage, mergeAndCalculateAverage } from "./average";
