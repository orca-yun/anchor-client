export const toZhNumber = (val: number, digital = 2) => {
  if (isNaN(val)) return val
  try {
    return Number(val).toLocaleString('zh', {
      minimumFractionDigits: digital,
      maximumFractionDigits: digital,
    })
  } catch (e) {
    return val
  }
}
