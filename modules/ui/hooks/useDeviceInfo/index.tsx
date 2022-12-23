import get_device from '@techytools/fn/esm/browser/device/get_device';
import is_webview from '@techytools/fn/esm/browser/device/is_webview';
import { useEffect, useState } from 'react';

export type deviceInfoType = {
  inWebview: boolean;
  inIframe: boolean;
  device: string;
};

/**
 * To use as a regular helper function, inside your own useEffect function.
 * In case you can't call the hook for some reason, try this.
 */
export const returnDeviceInfo = (): deviceInfoType => {
  return {
    inWebview: is_webview(),
    inIframe:
      typeof self === 'object' && typeof top === 'object' && self !== top,
    device: get_device(),
  };
};

/**
 * detect if component is rendered inside an iframe
 */
const useDeviceInfo = (): deviceInfoType => {
  const [device, set_device] = useState('');
  const [inIframe, set_inIframe] = useState(false);
  const [inWebview, set_inWebview] = useState(false);

  useEffect(() => {
    // This useEffect only needs to run once, because after window is ready, these values will never change
    // iframe
    if (typeof self === 'object' && typeof top === 'object' && self !== top) {
      // rendered inside an iframe
      set_inIframe(true);
    }
    // device
    set_device(get_device());
    // webview
    set_inWebview(is_webview());
  }, []);

  return {
    inWebview,
    inIframe,
    device,
  };
};

export default useDeviceInfo;
