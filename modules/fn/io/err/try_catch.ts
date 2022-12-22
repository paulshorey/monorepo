/**
 * Alternative to try {} catch(e){} block. Execute it as a function.
 */
export default function try_catch(tryCode: Function, catchAction: Function): void {
  try {
    tryCode();
  } catch (err) {
    // cconsole is not a typo, it's the name of a global custom console logger
    // this is to save time, so you don't have to type console.error() in every handler
    // @ts-ignore
    // typeof cconsole === "object" ? cconsole.error(err) : console.error(err);
    // handle error
    if (typeof catchAction === "function") catchAction(err);
  }
}
