/**
 * Use this to type "one of" from list:
 * export type colorKeyType = ObjectFromList<typeof colorKeys, boolean>;
 */
export type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};

/** Idk, forget how to use this */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** Also search for tsFix in comments */
export type tsFix = any;

/** Alternative to ` & ` operator, forget why its better sometimes */
export type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;

// /** Like Merge, but also merges nested object types instead of just replacing the whole thing */
// export type MergeDeep<
//   A extends Record<string, any>,
//   B extends DeepPartialAny<A>
// > = {
//   [K in keyof A]: B[K] extends never
//     ? A[K]
//     : B[K] extends Record<string, any>
//     ? MergeDeep<A[K], B[K]>
//     : B[K];
// } & (A extends Record<string, any> ? Omit<B, keyof A> : A);

// /** Makes each property optional and turns each leaf property into any, allowing for type overrides by narrowing any. */
// type DeepPartialAny<T> = {
//   [P in keyof T]?: T[P] extends Record<string, any>
//     ? DeepPartialAny<T[P]>
//     : any;
// };
