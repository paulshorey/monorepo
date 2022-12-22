export default function average(values) {
  let sum = values.reduce((previous, current) => (current += previous));
  return sum / values.length;
}
