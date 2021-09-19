import * as AWS from 'aws-sdk'
import type { QUERY, QUERY_BETWEEN, QUERY_INDEX, QUERY_INDEX_BETWEEN, QUERY_INDEX_SORT, QUERY_SORT } from './index.d'
import { customAlphabet } from 'nanoid'

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_APP,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_APP,
  region: 'ap-southeast-1'
})

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
export const ddb: AWS.DynamoDB.Types = new AWS.DynamoDB()
const client: AWS.DynamoDB.Types.DocumentClient = new AWS.DynamoDB.DocumentClient()

const generateKeyProjection = (item: any) => (item ? item.reduce((sum: any, cur: any) => ({ ...sum, ['#' + nanoid()]: cur }), {}) : null)

export const query = async (fn: QUERY) => {
  const expName: AWS.DynamoDB.ExpressionAttributeNameMap = generateKeyProjection(fn.project)
  let params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: fn.tableName,
    ScanIndexForward: false,
    KeyConditionExpression: "#ID = :ID",
    ExpressionAttributeNames: {
      "#ID": fn.pk,
      ...expName
    },
    ExpressionAttributeValues: {
      ":ID": fn.pv
    },
    ProjectionExpression: fn.project ? Object.keys(expName).join() : null,
    Limit: fn.limit
  }

  return new Promise<any[]>(resolve => {
    client.query(params, (err, data) => {
      if (err) {
        console.log(err)
        resolve([])
      }
      resolve(data.Items ?? [])
    })
  })
}

export const querySort = async (fn: QUERY_SORT) => {
  const expName: AWS.DynamoDB.ExpressionAttributeNameMap = generateKeyProjection(fn.project)
  let params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: fn.tableName,
    ScanIndexForward: false,
    KeyConditionExpression: "#ID = :ID and #SK = :SK",
    ExpressionAttributeNames: {
      "#ID": fn.pk,
      "#SK": fn.sk,
      ...expName
    },
    ExpressionAttributeValues: {
      ":ID": fn.pv,
      ":SK": fn.sv
    },
    ProjectionExpression: fn.project ? Object.keys(expName).join() : null,
    Limit: fn.limit
  }
  // console.log({params})
  return new Promise<any[]>(resolve => {
    client.query(params, (err, data) => {
      if (err) {
        console.log(err)
        resolve([])
      }
      resolve(data.Items ?? [])
    })
  })
}

export const queryIndex = async (fn: QUERY_INDEX) => {
  let expName: AWS.DynamoDB.ExpressionAttributeNameMap
  if (fn.project) expName = generateKeyProjection(fn.project)

  let params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: fn.tableName,
    IndexName: fn.indexName,
    ScanIndexForward: false,
    KeyConditionExpression: "#ID = :ID",
    ExpressionAttributeNames: {
      "#ID": fn.pk,
      ...expName
    },
    ExpressionAttributeValues: {
      ":ID": fn.pv
    },
    ProjectionExpression: fn.project ? Object.keys(expName).join() : null,
    Limit: fn.limit,
    ExclusiveStartKey: fn.lastEvaluatedKey
  }
  return new Promise<any>(resolve => {
    client.query(params, (err, data) => {
      if (err) {
        // console.log(err)
        resolve([])
      }
      // console.log({ data });
      resolve({ data: data?.Items ?? [], lastEvaluatedKey: data?.LastEvaluatedKey })
    })
  })
}

export const queryIndexBetween = async (fn: QUERY_INDEX_BETWEEN) => {
  let expName: AWS.DynamoDB.ExpressionAttributeNameMap
  if (fn.project) expName = generateKeyProjection(fn.project)

  let params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: fn.tableName,
    IndexName: fn.indexName,
    ScanIndexForward: false,
    KeyConditionExpression: "#ID = :ID and #SK between :BGW and :END",
    ExpressionAttributeNames: {
      "#ID": fn.pk,
      "#SK": fn.sk,
      ...expName
    },
    ExpressionAttributeValues: {
      ":ID": fn.pv,
      ":BGW": fn.start,
      ":END": fn.end,
    },
    ProjectionExpression: fn.project ? Object.keys(expName).join() : null,
    Limit: fn.limit
  }
  return new Promise<any[]>(resolve => {
    client.query(params, (err, data) => {
      if (err) {
        console.log(err)
        resolve([])
      }
      resolve(data.Items ?? [])
    })
  })
}

const generateFilterExpressionAttributeNames = (item: any) => (item ? item.reduce((sum: any, cur: any) => ({ ...sum, [`#${cur[0]}`]: cur[0] }), {}) : null)
const generateFilterExpressionAttributeValues = (item: any) => (item ? item.reduce((sum: any, cur: any) => ({ ...sum, [`:${cur[0]}`]: cur[1] }), {}) : null)
// const generateFilterExpression = (item: any) => (item ? item.reduce((sum: any, cur: any) => ({ ...sum, [`#${cur[0]}`]: `:${cur[0]}` }), {}) : null)

export const queryIndexSort = async (fn: QUERY_INDEX_SORT) => {
  let expName: AWS.DynamoDB.ExpressionAttributeNameMap
  let filExpAttrNames: AWS.DynamoDB.ExpressionAttributeNameMap
  let filExpAttrVaules: AWS.DynamoDB.ExpressionAttributeValueMap
  // let filExp: AWS.DynamoDB.ConditionExpression
  let filExp: any
  if (fn.project) expName = generateKeyProjection(fn.project)
  if (fn.filters.length !== 0) {
    filExpAttrNames = generateFilterExpressionAttributeNames(fn.filters)
    filExpAttrVaules = generateFilterExpressionAttributeValues(fn.filters)
    filExp = fn.filters.map((item: any) => `#${item[0]}=:${item[0]}`).join(' AND ')
  }

  let params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: fn.tableName,
    IndexName: fn.indexName,
    ScanIndexForward: false,
    KeyConditionExpression: "#ID = :ID and #SK = :SK",
    ExpressionAttributeNames: {
      "#ID": fn.pk,
      "#SK": fn.sk,
      ...expName,
      ...filExpAttrNames
    },
    ExpressionAttributeValues: {
      ":ID": fn.pv,
      ":SK": fn.sv,
      ...filExpAttrVaules
    },
    FilterExpression: filExp,
    ProjectionExpression: fn.project ? Object.keys(expName).join() : null,
    Limit: fn.limit
  }
  // console.log({ params })
  return new Promise<any[]>(resolve => {
    client.query(params, (err, data) => {
      if (err) {
        console.log(err)
        resolve([])
      }
      resolve(data.Items ?? [])
    })
  })
}