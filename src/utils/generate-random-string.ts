export function generateRandomString(length: number) {
  return Array(length)
    .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
    .map((x) => x[Math.floor(Math.random() * x.length)])
    .join('');
}
