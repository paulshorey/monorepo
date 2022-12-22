export default function is_retina() {
  // return boolean:
  return typeof window === "object"
    ? window.matchMedia("(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)")
        .matches
    : false;
}
