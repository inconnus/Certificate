export type PROJECT_KEYS = Array<string>

export type QUERY = {
  tableName: string
  pk: string
  pv: any
  limit?: number
  project?: PROJECT_KEYS | []
}

export type QUERY_INDEX = {
  tableName: string
  indexName: string
  pk: string
  pv: string | number
  project?: PROJECT_KEYS
  limit?: number,
  lastEvaluatedKey?: any
}

export type QUERY_INDEX_BETWEEN = {
  tableName: string
  indexName: string
  pk: string
  pv: string
  sk: string
  start: string | number
  end: string | number
  project?: PROJECT_KEYS
  limit?: number
  filters?: any
  lastEvaluatedKey?: any
}

export type QUERY_INDEX_SORT = {
  tableName: string
  indexName: string
  pk: string
  pv: string
  sk: string
  sv: string
  project?: PROJECT_KEYS
  filters?: any
  limit?: number
  lastEvaluatedKey?: any
}

export type QUERY_SORT = {
  tableName: string
  pk: string
  pv: string
  sk: string
  sv: string
  project?: PROJECT_KEYS | []
  limit?: number
}

export type QUERY_BETWEEN = {
  tableName: string
  pk: string
  pv: string
  sk: string
  start: string | number
  end: string | number
  project?: PROJECT_KEYS | []
  limit?: number
}