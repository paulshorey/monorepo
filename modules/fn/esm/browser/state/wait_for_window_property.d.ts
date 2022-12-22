/**
 * Wait for window property to exist before running script
 *     Because useEffect(function(){}, [typeof window === 'object' && window.myVariable]) is not reliable
 *     Usage (simple):
 *       wait_for_window_property("myVariable", function() {
 *         console.debug("myVariable is defined: ", window.myVariable);
 *       });
 *     If you only need to wait for window/DOM, then definitely just keep using useEffect()
 * @param {string} globalVariableName - window.yourVariable
 * @param {function} callback - function to run when window property is defined
 * @param {string} variableType - (optional) wait until window variable becomes this type
 *    Do not pass "undefined" because it starts out as undefined. Do "object" "string" etc.
 *    Does not differentiate between Object or Array, only checks for basic typeof.
 */
export default function wait_for_window_property(globalVariableName: string, callback: Function, variableType?: string): void;
