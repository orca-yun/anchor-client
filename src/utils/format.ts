import { isDigitalReg } from './regexp'

export const safeParse = (str: string, defaultValue: any) => {
  try {
    return JSON.parse(str) || defaultValue
  } catch (e: any) {
    console.warn(e?.message)
  }
  return defaultValue
}

export const toNumber = (num: string, defaultNum = 0) => {
  if (isDigitalReg.test(num)) return Number(num)
  return defaultNum
}
