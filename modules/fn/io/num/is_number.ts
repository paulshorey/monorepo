export default function is_number(variable) {
  if (variable === null) {
    return false;
  }
  if (typeof variable === "string") {
    variable = Number(variable);
  }
  if (isNaN(variable)) {
    return false;
  }
  return true;
}
