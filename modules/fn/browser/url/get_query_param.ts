/**
 * Parse window.location URL parameter
 * @param key - key to get value of
 * @returns value of the key
 */
export default function (key: string): string {
  if (typeof window === "undefined") return "";
  if (typeof URLSearchParams === "undefined") return "";
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get(key);
  return param || "";
}
