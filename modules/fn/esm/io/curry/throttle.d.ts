/**
 * Returns curried function.
 * Calling curry will execute first function immediately. But subsequent calls will be dropped if not enough time has passed.
 */
export default function throttle(
/**
 * Function to throttle
 */
func: Function, 
/**
 * Throttle for number of milliseconds
 */
delay: number): Function;
