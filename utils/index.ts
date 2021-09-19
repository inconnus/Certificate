export const convertQueryParamsToFilters = (item: any) => {
  const filters = []
  for (const key in item) filters.push([key, item[key]])
  return filters
}

export const accessKeyChecking = (key:string) => key === process.env.ACCESS_KEY