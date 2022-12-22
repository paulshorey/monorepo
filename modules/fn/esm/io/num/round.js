/**
 * Round to the nearest integer, by increment: 1, 10, 100, 1000, etc.
 * @param increment - Default is 1. You can pass 10, 100, 1000, etc.
 */
export default function round(num, increment = 1) {
    return Math.round(num / increment) * increment;
}
