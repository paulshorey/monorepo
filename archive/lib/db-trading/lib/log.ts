export const dbLog = {
  log(message: string, context?: unknown) {
    if (context !== undefined) {
      console.log(message, context);
      return;
    }
    console.log(message);
  },
  error(message: string, context?: unknown) {
    if (context !== undefined) {
      console.error(message, context);
      return;
    }
    console.error(message);
  },
};
