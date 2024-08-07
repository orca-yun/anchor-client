// 以roomId作为存储策略
import { safeJsonParser } from './safeJsonParser'

type IStorage = Record<string | number, any>

const getStorage = (storageKey: string, defaultValue = {}) => safeJsonParser(localStorage.getItem(storageKey), defaultValue)

export const setStorageWithKey = (storageKey: string, storageObj: IStorage) => {
  const originStorageData = getStorage(storageKey)
  localStorage.setItem(storageKey, JSON.stringify({
    ...originStorageData,
    ...storageObj,
  }))
}

export const getStorageWithKey = (storageKey: string, uniqueKey: string | number) => {
  const originStorageData = getStorage(storageKey)
  return originStorageData[uniqueKey]
}

export const removeStorageWithKey = (storageKey: string, uniqueKey: string | number) => {
  const originStorageData = getStorage(storageKey)
  delete originStorageData[uniqueKey]
  localStorage.setItem(storageKey, JSON.stringify(originStorageData))
}
