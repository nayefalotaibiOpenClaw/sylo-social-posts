export function cleanCode(raw: string): string {
  return raw.replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/gm, '').replace(/```$/gm, '').trim();
}
