process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndex, queryIndexBetween, queryIndexSort } from "lib/DynamoDB"
import { accessKeyChecking, convertQueryParamsToFilters } from "utils"

interface IFilter {
  firstName?: string,
  lastName?: string,
  email?: string,
  timestamp?: string,
  topic?: string,
  from?: number,
  to?: number
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, key, limit, lastEvaluatedKey, ...filter_params }: any = req.query
  if (!accessKeyChecking(key)) return res.status(200).json({ resCode: "400" })

  // console.log({ filter_params })
  let filters = undefined
  if (filter_params) filters = convertQueryParamsToFilters(filter_params)

  const keys = Object.keys(filter_params)
  if (keys.length == 1) {
    const __key = keys[0]
    const text = filter_params[__key]
    switch (__key) {
      case 'email': {
        const found_matches = (await queryIndexSort({
          tableName: process.env.TABLE_NAME,
          indexName: process.env.INDEX_EMAIL,
          pk: 'organizer',
          pv: course,
          sk: 'email',
          sv: text.toLowerCase().trim(),
          filters: [],
          limit: limit,
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        return res.status(200).json({
          resCode: "200",
          data: found_matches.data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }

      case 'firstName': {
        const found_matches = (await queryIndexSort({
          tableName: process.env.TABLE_NAME,
          indexName: process.env.INDEX_FIRSTNAME,
          pk: 'organizer',
          pv: course,
          sk: 'firstName',
          sv: text.toLowerCase().trim(),
          filters: [],
          limit: limit,
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        return res.status(200).json({
          resCode: "200",
          data: found_matches.data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }

      case 'lastName': {
        const found_matches = (await queryIndexSort({
          tableName: process.env.TABLE_NAME,
          indexName: process.env.INDEX_LASTNAME,
          pk: 'organizer',
          pv: course,
          sk: 'lastName',
          sv: text.toLowerCase().trim(),
          filters: [],
          limit: limit,
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        return res.status(200).json({
          resCode: "200",
          data: found_matches.data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }

      case 'trainingTopic': {
        const found_matches = (await queryIndexSort({
          tableName: process.env.TABLE_NAME,
          indexName: process.env.INDEX_TRAININGTOPIC,
          pk: 'organizer',
          pv: course,
          sk: 'trainingTopic',
          sv: text,
          limit: limit,
          filters: [],
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        return res.status(200).json({
          resCode: "200",
          data: found_matches.data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }

      default:
        break
    }
  }

  if (filter_params.hasOwnProperty('from') && filter_params.hasOwnProperty('to')) {

    let filters = undefined
    const { from, to, ...left_params } = filter_params
    if (filter_params) filters = convertQueryParamsToFilters(left_params)
    const found_matches = (await queryIndexBetween({
      tableName: process.env.TABLE_NAME,
      indexName: process.env.INDEX_TIMESTAMP,
      pk: 'organizer',
      pv: course,
      sk: 'timestamp',
      start: Number(from),
      end: Number(to),
      limit: limit,
      lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
      filters: filters
    })) ?? []
    // console.log(`--- case 2 `, found_matches)
    return res.status(200).json({
      resCode: "200",
      data: found_matches.data,
      lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
    })
  }

  if (filter_params.hasOwnProperty('email')){
    let filters = undefined
    const { email, ...left_params } = filter_params
    if (filter_params) filters = convertQueryParamsToFilters(left_params)
    const found_matches = (await queryIndexSort({
      tableName: process.env.TABLE_NAME,
      indexName: process.env.INDEX_EMAIL,
      pk: 'organizer',
      pv: course,
      sk: 'email',
      sv: email.toLowerCase().trim(),
      filters: filters,
      limit: limit,
      lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
    })) ?? []
    return res.status(200).json({
      resCode: "200",
      data: found_matches.data,
      lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
    })
  }
  
  const found_matches = (await queryIndex({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_EMAIL,
    pk: 'organizer',
    pv: course,
    limit: limit,
    filters: filters,
    lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
  })) ?? []

  return res.status(200).json({
    resCode: "200",
    data: found_matches.data,
    lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
  })
}

