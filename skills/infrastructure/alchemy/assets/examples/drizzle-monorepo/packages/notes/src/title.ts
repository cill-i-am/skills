/** Pure domain policy: no Effect runtime, database, or cloud dependency. */
export function normalizeTitle(value: string): string | undefined {
  const title = value.trim();
  return title.length > 0 && title.length <= 200 ? title : undefined;
}
