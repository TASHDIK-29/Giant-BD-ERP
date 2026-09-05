export function normalizePermissionKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

export function normalizePermissionAction(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}