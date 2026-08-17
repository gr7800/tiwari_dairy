export function calculateAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100;
}
