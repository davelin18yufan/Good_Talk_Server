/**
 * Safely parses a value into a boolean or returns `undefined` if the value cannot be parsed.
 *
 * @param value - The value to be parsed. It can be of any type.
 * @returns `true` if the value is the string `"true"`, `false` if the value is the string `"false"`,
 *          or `undefined` for any other value, including `undefined` itself.
 */
export function safeParseBoolean(value: any): boolean | undefined {
  if (value === undefined) return undefined
  if (value === "true") return true
  if (value === "false") return false
  return undefined // 其他值一律當作 undefined
}
