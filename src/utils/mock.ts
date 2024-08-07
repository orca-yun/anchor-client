export const mockData = <T>(time: number, data: T) =>
  new Promise((resolve) => setTimeout(resolve.bind(null, data), time))
