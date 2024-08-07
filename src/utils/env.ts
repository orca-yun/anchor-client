export const env = import.meta.env

// 开发环境
export const isDevelopment = env.MODE === 'development'
export const isLocal = env.MODE === 'prod-local'
