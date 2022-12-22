/**
 * Returns curried function.
 * Calling curry will execute first function immediately. But subsequent calls will be dropped if not enough time has passed.
 */
export default function throttle(
/**
 * Function to throttle
 */
func, 
/**
 * Throttle for number of milliseconds
 */
delay) {
    let lastCall = 0;
    return function (...args) {
        let now = new Date().getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}
