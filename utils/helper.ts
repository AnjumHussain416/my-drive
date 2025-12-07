export function getUnique<T>(arr: (T | null | undefined)[]): T[] {
  return Array.from(new Set(arr.filter(Boolean))) as T[];
}

export const revalidate = 60 * 60 * 24;
