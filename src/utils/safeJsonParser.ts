export const safeJsonParser = (data: string | null, defaultValue: any) => {
  try {
    if (!data) return defaultValue
    data = JSON.parse(data as any)
    if (Object.prototype.toString.call(data) === Object.prototype.toString.call(defaultValue)) return data
  } catch (e) {
    return defaultValue
  }
  return defaultValue
}
