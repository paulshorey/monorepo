export default function mean(values) {
  values.sort((a, b) => a - b);
  let lowMiddle = Math.floor((values.length - 1) / 2);
  let highMiddle = Math.ceil((values.length - 1) / 2);
  return (values[lowMiddle] + values[highMiddle]) / 2;
}
