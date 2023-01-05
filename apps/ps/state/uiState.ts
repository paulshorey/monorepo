import { persist } from 'zustand/middleware';
import create from 'zustand';

export type uiStateType = {
  colorSchemes: string[];
  colorSchemeIndex: number;
  colorSchemeIndexToggle: () => void;
  clicks: number;
  clicksIncrement: () => void;
};

const ui = create(
  persist(
    (set, get) => ({
      /*
       * Color schemes
       */
      colorSchemes: ['coolrainbow', 'light', 'dark'],
      colorSchemeIndex: 0,
      colorSchemeIndexToggle: () => {
        const state = get() as uiStateType;
        // convert to 1-based index, math remainder, then back to 0-based index
        return set({
          colorSchemeIndex: ((state.colorSchemeIndex + 1) % 3) - 1,
        });
      },
      /*
       * Count product usage before displaying paywall/CTA
       */
      clicks: 3,
      clicksIncrement: () => {
        const state = get() as uiStateType;
        return set({ clicks: state.clicks + 1 });
      },
    }),
    {
      name: 'ui-cache',
    }
  )
);

export default ui;
