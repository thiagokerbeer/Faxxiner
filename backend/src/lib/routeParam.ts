/**
 * @types/express v5 tipa params como string | string[]; em :id do Express 4 vem string única.
 */
export function routeParamAsString(value: string | string[] | undefined): string {
  if (value === undefined) return "";
  return Array.isArray(value) ? (value[0] ?? "") : value;
}
