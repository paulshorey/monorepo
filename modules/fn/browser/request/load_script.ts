type Props = {
  /**
   * external URL to load
   */
  src: string;
  /**
   * object of attributes to add to the new <script> tag
   */
  scriptAttrs?: Record<string, string | number | boolean>;
};

/**
 * Load external script into html page
 */
export default function load_script({ src, scriptAttrs = {} }: Props) {
  if (!src) return false;
  if (typeof window !== "object" || typeof document !== "object") return false;
  return new Promise((resolve, reject) => {
    let script = document.createElement("script") as any; // tsFixMe

    // force certain attributes
    script.async = true;
    script.defer = true;
    for (let key in scriptAttrs) {
      script[key] = scriptAttrs[key];
    }

    // NOTE: needs refactor: maybe .bind(script)
    function onloadHander(_, isAbort) {
      if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
        script.onload = null;
        script.onreadystatechange = null;
        script = undefined;

        if (isAbort) {
          reject();
        } else {
          resolve(true);
        }
      }
    }

    script.onload = onloadHander;
    script.onreadystatechange = onloadHander;

    script.src = src;
    window.document.body.append(script);
    resolve(true);
  });
}
