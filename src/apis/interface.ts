export interface CommonRes<T> {
  code: number
  data: T
  msg: string
}

export type CommonTableListRes<T> = CommonRes<{
  page: number
  pageSize: number
  total: number
  rows: T[]
}>
