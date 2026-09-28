import { StrengthDataAdd } from "./types";

export function parseStrengthText(bodyText: string): StrengthDataAdd {
  const data = {} as StrengthDataAdd;
  const pairs = bodyText.trim().split(/\s+/);

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value !== undefined) {
      if (key === "ticker") {
        data.ticker = value !== "{{ticker}}" ? value : null;
      } else if (key === "interval") {
        data.interval = value !== "{{interval}}" ? value : null;
      } else if (key === "time") {
      } else if (key === "price") {
        const num = parseFloat(value);
        data.price = !isNaN(num) ? num : null;
      } else if (key === "strength") {
        const num = parseFloat(value);
        data.strength = !isNaN(num) ? num : null;
      } else if (key === "volume") {
        const num = parseFloat(value);
        data.volume = !isNaN(num) ? num : null;
      }
    }
  }

  return data;
}
