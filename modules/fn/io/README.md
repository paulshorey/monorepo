# INPUT -> OUTPUT

> Pure functions. Immutable.
> Do not have side-effects. Do not rely on external state, on window or process. Do not make network requests.

## EXCEPT

There may be a couple functions which DO mutate the array/object. These return void. Watch out for that. One is `insert_into_sorted_array(array: T[], value: T): void`. There is a WARNING in the JsDoc Typescript description.

## Dependencies

NONE
