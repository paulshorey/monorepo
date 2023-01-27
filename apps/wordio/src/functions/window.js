/*
 * All these functions rely on the global window object.
 * Each will return undefined if window undefined.
 * So, ok to use in SSR, but don't rely on return value!
 * Consider using with useSWR() to automatically re-fetch value on client-side.
 */
export const is_ios = function () {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
      window.navigator?.userAgentData?.platform || window.navigator?.platform || ''
    ) ||
    // iPad on iOS 13 detection
    (window.navigator.userAgent.includes('Mac') && 'ontouchend' in window.document)
  );
};
export const is_iphone = function () {
  // detects only iPhone (phone) device, not just any iOS device.
  // includes iPod as well (close enough to iPhone) but not iPad (tablet, not phone!)
  return (
    ['iPhone Simulator', 'iPod Simulator', 'iPhone', 'iPod'].includes(
      window.navigator?.userAgentData?.platform || window.navigator?.platform || ''
    ) ||
    // iPad on iOS 13 detection
    (window.navigator.userAgent.includes('Mac') && 'ontouchend' in window.document)
  );
};

export const href_canonical = function (href) {
  if (typeof window === 'undefined') return href;
  return href
    .replace('www.spiral.us', 'spiral.us') // ensure consistency, strip then add back in
    .replace(`http//localhost:3000${window.location.pathname}`, '')
    .replace(`http//localhost:3000`, '')
    .replace(`${window.location.protocol}//${window.location.host}${window.location.pathname}`, '')
    .replace(`${window.location.protocol}//${window.location.host}`, '')
    .replace('spiral.us', 'www.spiral.us')
    .replace('http://spiral.us', 'https://www.spiral.us'); // for consistency, always use canonical URL
};

export const setABVariant = function (experimentKey, experimentVariant) {
  if (typeof window === 'undefined') return;
  // always save to localStorage as type string
  experimentVariant = experimentVariant ? experimentVariant + '' : '';
  window.localStorage.setItem('qs_' + experimentKey, experimentVariant);
  // for debugging:
  window.abVariants = window.abVariants || {};
  window.abVariants[experimentKey] = experimentVariant;
};
/**
 * Calculate which variant to render
 * @param name {String}
 * @param variants {Array<string>} - list of variants, in same order as weights
 * @param weights {Array<number>} - (optional) list of percentages, in same order as variants
 * @returns {string|undefined|null}
 *    if this was attempted on server-side (not allowed) - will return undefined
 *    if this has been run previously on client-side - use same variant as last time
 *    if this is run for the first time on client-side - use random variant by weights
 */
export const getABVariant = function getABVariant({ name, variants, weights }) {
  if (!variants || !name) return null;
  if (typeof window === 'undefined') return;
  let abVariant;
  // 1. read from URL queryString
  if (!abVariant) {
    if (typeof URLSearchParams === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    abVariant = urlParams.get(name);
    if (abVariant) {
      setABVariant(name, abVariant);
    }
  }
  // 2. try to get from localStorage
  if (!abVariant) {
    abVariant = window.localStorage.getItem('qs_' + name);
  }
  // 3. no variant specified? decide which one to show
  if_decide: if (!abVariant) {
    if (weights && weights.length === variants.length) {
      // custom weights provided
      let total = weights.reduce((acc, n) => acc + n, 0);
      if (total === 0) {
        return 'disabled';
      }
      // Don't need to go through all numbers again,
      // just until the first one greater than random 0-1 value.
      let acc = 0;
      let random = Math.random();
      for (let i in weights) {
        acc += weights[i];
        let fraction = acc / total;
        if (random < fraction) {
          abVariant = variants[i];
          break;
        }
      }
    } else {
      // default: equal weights
      let i = Math.floor(Math.random() * variants.length);
      abVariant = variants[i];
    }
    setABVariant(name, abVariant);
  }
  //
  return abVariant;
};

export const getAttributionParams = function getAttributionParams() {
  if (typeof window === 'undefined') return {};
  // try to get from localStorage
  let refId = window.localStorage.getItem('qs_refId');
  let pid = window.localStorage.getItem('qs_pid');
  let c = window.localStorage.getItem('qs_c');
  // get from URL queryString
  if (!refId && !pid && !c) {
    if (typeof URLSearchParams === 'undefined') return {};
    const urlParams = new URLSearchParams(window.location.search);
    // read from querystring
    refId = urlParams.get('refId');
    if (refId) refId = refId.toLowerCase();
    pid = urlParams.get('pid');
    if (pid) pid = pid.toLowerCase();
    c = urlParams.get('c');
    if (c) c = c.toLowerCase();
    // save to localStorage as type string
    window.localStorage.setItem('qs_refId', refId || '');
    window.localStorage.setItem('qs_pid', pid || '');
    window.localStorage.setItem('qs_c', c || '');
  }
  return { refId, pid, c };
};

export const getQueryParam = function getQueryParam(key) {
  if (typeof window === 'undefined') return undefined;
  // get from cache
  let val = window['qs_' + key];
  // get from url
  if (val === undefined) {
    if (typeof URLSearchParams === 'undefined') return undefined;
    const urlParams = new URLSearchParams(window.location.search);
    // read
    val = urlParams.get(key);
    // cache
    window['qs_' + key] = val;
  }
  return val;
};

/**
 * Generate disclosure numbers incrementally 1-9, from top of the page to the bottom.
 * @params type {string} - "number" if incrementing 1-9
 *    If you want to increment with a symbol, like "*", "**", "***", then pass the symbol to use.
 *    In this example, type would equal "*". But ok to pass any character or string.
 */
export const getNextDisclosureSymbol = function getNextDisclosureSymbol(type = '*') {
  if (typeof window === 'undefined') return undefined;
  let nextSymbol = '';
  // get last
  let lastSymbol = window['lastDisclosureSymbol_type-' + type] || ''; // IMPORTANT! WARNING! Can special characters be used as a property key? If not, then convert ${type} to a-z string which can be used in an object property.
  if (type === 'number') {
    // is number (0,1,2,3,...)
    // increment by adding +1
    nextSymbol = Number(lastSymbol || 0);
    if (!isNaN(nextSymbol)) {
      nextSymbol++;
    }
  } else {
    // is symbol (could be anything, like * ℹ︎ ❦, type === initial value)
    // increment by adding another same character, so from "*" to "**" to "***"
    nextSymbol = lastSymbol + type;
  }
  // save
  window['lastDisclosureSymbol_' + type] = nextSymbol;
  return nextSymbol;
};

export const checkIfWebView = function checkIfWebView() {
  // if not server-side, check userAgent
  if (typeof window === 'object') {
    if (/iPhone|iPad|iPod/.test(window.navigator.userAgent)) {
      if (
        !/Version|Chrome|CriOS|OPT|Firefox|Fxi|Kiwi|Dolphin|Opera/.test(window.navigator.userAgent)
      ) {
        console.log('IS WEBVIEW');
        return true;
      }
    }
  }
  return false;
};

export const getQueryVariable = function getQueryVariable(variable) {
  let query = window.location.search.substring(1);
  let vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return '';
};

/*
 * Wait for window property to exist before running script
 * Because useEffect(function(){}, [typeof window === 'object' && window.myVariable]) is not reliable
 * Usage (simple):
 *   waitForGlobal("myVariable", function() {
 *     console.debug("myVariable is defined: ", window.myVariable);
 *   });
 */
export const waitForGlobal = function (globalVariableName, callback, variableType) {
  if (
    typeof window === 'object' &&
    window[globalVariableName] !== undefined &&
    (!variableType || typeof window[globalVariableName] === variableType)
  ) {
    // console.log('window.' + globalVariableName + ' ===', window[globalVariableName]);
    callback();
  } else {
    // console.log('waitForGlobal - wait longer');
    setTimeout(function () {
      waitForGlobal(globalVariableName, callback);
    }, 100);
  }
};
