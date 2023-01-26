import { persist } from 'zustand/middleware';
import { create } from 'zustand';

/*
 * TODO: maybe refactor this? host/path use redundant logic
 */

export type controlsStateType = {
  // what sizes to preview (what sizes to render iframes showing the sites to test)
  sizePresets: Record<string, Array<[number, number, string]>>;
  sizePresetKey: string;
  set_size: (key: string) => void;
  /** site path, starting at forward slash. Includes query string and everything */
  paths: string[];
  pathIndex: number;
  /** if doesn't exist, value will be added */
  set_path: (path: string) => void;
  remove_path: (path: string) => void;
  /** site host, including protocol */
  hosts: string[];
  hostIndex: number;
  /** if doesn't exist, value will be added */
  set_host: (host: string) => void;
  remove_host: (host: string) => void;
};

const controls = create(
  persist(
    (set, get) => ({
      /*
       * sizes
       */
      sizePresets: {
        'typical sizes': [
          [375, 944, '375 x 850 (tall narrow phone)'],
          [1180, 768, '1180 x 768 (small laptop)'],
          [768, 1024, '820 x 1180 (iPad air portrait orientation)'],
        ],
        'mobile devices': [
          [375, 812, '375 x 812 (iPhone X, Mini)'],
          [390, 844, '390 x 844 (iPhone 12 Pro)'],
          [428, 926, '428 x 926 (iPhone Max)'],
          [768, 1024, '768 x 1024 (iPad 9.7in and Mini)'],
          // [850, 414, '850 x 414 (iPhone turned landscape)'],
        ],
        'desktop devices': [
          [1024, 1366, '1024 x 1366 (iPad 12.9 portrait)'],
          [1280, 766, '1280 x 766 (smaller laptop)'],
          [1440, 600, '1440 x 600 (very short Windows laptop)'],
          [1520, 944, '1520 x 944 (larger laptop)'],
        ],
        'edge cases (short but wide laptop, GoogleBot mobile and desktop)': [
          [375, 9300, '375 - old iPhones width x GoogleBot mobile'],
          [931, 9300, '931px - narrowest desktop width x GoogleBot Desktop'],
          [
            1530,
            533,
            '1530 x 533 (some small laptops with too many menus on top/bottom)',
          ],
        ],
      },
      sizePresetKey: 'desktop devices',
      set_size: (key) => {
        set({ sizePresetKey: key });
      },
      /*
       * host
       */
      hosts: ['https://paulshorey.com'],
      hostIndex: 0,
      set_host: (host) => {
        const state = get() as controlsStateType;
        const index = state.hosts.indexOf(host);
        if (isNaN(index) || index === -1) {
          // validate host
          if (!host.startsWith('http')) {
            alert(
              'Host must include protocol (must start with http:// or https://).'
            );
            return;
          }
          // create new
          state.hosts.push(host);
          state.hostIndex = state.hosts.length - 1;
        } else {
          // use existing
          state.hostIndex = index;
        }
        return set({ ...state });
      },
      remove_host: (host) => {
        const state = get() as controlsStateType;
        const index = state.hosts.indexOf(host);
        if (!isNaN(index) && index !== -1) {
          // validate
          if (state.hosts.length < 2) {
            alert(
              'Can not delete the one remaining host. Please add another one first.'
            );
            return;
          }
          // remove host, fix index if affected
          state.hosts.splice(index, 1);
          if (state.hostIndex <= index) {
            state.hostIndex++;
          }
          return set({ ...state });
        }
      },
      /*
       * path
       */
      paths: ['/'],
      pathIndex: 0,
      set_path: (path) => {
        if (path[0] !== '/') {
          path = '/' + path;
        }
        const state = get() as controlsStateType;
        const index = state.paths.indexOf(path);
        if (isNaN(index) || index === -1) {
          // create new
          state.paths.push(path);
          state.pathIndex = state.paths.length - 1;
        } else {
          // use existing
          state.pathIndex = index;
        }
        return set({ ...state });
      },
      remove_path: (path) => {
        const state = get() as controlsStateType;
        const index = state.paths.indexOf(path);
        if (!isNaN(index) && index !== -1) {
          // remove path, fix index if affected
          state.paths.splice(index, 1);
          if (state.pathIndex <= index) {
            state.pathIndex++;
          }
          return set({ ...state });
        }
      },
    }),
    {
      name: 'controls-cache9',
    }
  )
);

export default controls;
