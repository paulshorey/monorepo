/**
 * Returns curried function.
 * Calling curry will delay execution of funtion until delay time (ms).
 * While delay is in progress, extra function calls will be dropped, but after delay, latest attempted function will be called.
 */
export default function debounce(
/**
 * Function to delay
 */
func: Function, 
/**
 * Delay in milliseconds
 */
delay: number): Function;
