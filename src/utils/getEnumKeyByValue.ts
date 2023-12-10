export function getEnumKeyByValue(enumObj, value) {
  return Object.keys(enumObj)[Object.values(enumObj).indexOf(value)];
}
