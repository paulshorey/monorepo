import create from 'zustand';

export type appStateType = {
  turnstileToken: string;
  turnstileExpires: number;
  turnstileTokenSet: (token: string) => void;
  turnstileTokenGet: () => string;
};

const app = create((set, get) => ({
  turnstileToken: '',
  turnstileExpires: 0,
  /**
   * Sets new token and expiration time
   * Action will have to be performed before the expiration time
   */
  turnstileTokenSet: (token) => {
    set({
      // set new token
      turnstileToken: token,
      // expires after 295 seconds
      turnstileExpires: Date.now() + 295000,
    });
  },
  /**
   * Checks for expiration, returns token
   * If token is expired, returns empty string - component will have to re-render turnstile challenge
   */
  turnstileTokenGet: () => {
    const state = get() as appStateType;
    if (state.turnstileExpires < Date.now()) {
      return '';
    }
    return state.turnstileToken;
  },
}));

export default app;
