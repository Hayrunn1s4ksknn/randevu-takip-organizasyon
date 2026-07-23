export function toCsvValue(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function toCsvRow(values: string[]): string {
  return values.map(toCsvValue).join(',')
}
