export function applyStress(
  word: string,
  stressIndex: number
): string {
  return (
    word.slice(0, stressIndex + 1) +
    "\u0301" +
    word.slice(stressIndex + 1)
  );
}