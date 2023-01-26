import { persist } from 'zustand/middleware';
import { create } from 'zustand';

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
      colorSchemeIndex: 1,
      colorSchemeIndexToggle: () => {
        const state = get() as uiStateType;
        // convert to 1-based index, math remainder, then back to 0-based index
        state.colorSchemeIndex = ((state.colorSchemeIndex + 1) % 3) - 1;
        return set({ ...state });
      },
      /*
       * Count product usage before displaying paywall/CTA
       */
      clicks: 3,
      clicksIncrement: () => {
        const state = get() as uiStateType;
        state.clicks++;
        return set({ ...state });
      },
    }),
    {
      name: 'ui-cache',
    }
  )
);

export default ui;
