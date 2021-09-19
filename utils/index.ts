export const convertQueryParamsToFilters = (item: any) => {
  const filters = []
  for (const key in item) filters.push([key, item[key]])
  return filters
}