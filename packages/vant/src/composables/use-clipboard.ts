export async function useClipboard() {
  if (navigator?.clipboard?.readText) {
    return await navigator.clipboard.readText();
  }
  return undefined;
}
