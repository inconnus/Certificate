process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndex, queryIndexBetween, queryIndexSort } from "lib/DynamoDB"
import { accessKeyChecking, convertQueryParamsToFilters } from "utils"

const groupBy = (arr: any[], property: string) => {
  return arr.reduce((memo, x) => {
    if (!memo[x[property]]) { memo[x[property]] = []; }
    memo[x[property]].push(x);
    return memo;
  }, {});
}

const startsWithUppercase = (text: String) => text.slice(0, 1).match(/[A-Z\u00C0-\u00DC]/)

const sortData = (found_matches: any[]) => {
  const group_by_date = groupBy(found_matches, 'timestamp')
  const dates = Object.keys(group_by_date)
  let arranged_data: any[] = []
  dates.map(timestamp => {
    // const sorted = group_by_date[timestamp].sort((a: any, b: any) => a.firstName.localeCompare(b.firstName, 'th', { sensitivity: 'base' }))
    const sorted: any = group_by_date[timestamp].sort((a: any, b: any) => {
      if (a.firstName.slice(0, 1).toUpperCase() === b.firstName.slice(0, 1).toUpperCase()) {
        if (startsWithUppercase(a.firstName) && !startsWithUppercase(b.firstName)) {
          return -1;
        } else if (startsWithUppercase(b.firstName) && !startsWithUppercase(a.firstName)) {
          return 1;
        }
      }
      return a.firstName.localeCompare(b.firstName, 'th')
    })
    // console.log({ sorted })
    arranged_data = [...arranged_data, ...sorted]
  })
  // console.log({ arranged_data })
  return arranged_data
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, key, limit, lastEvaluatedKey, ...filter_params }: any = req.query
  if (!accessKeyChecking(key)) return res.status(200).json({ resCode: "400" })

  // console.log({ filter_params })
  let filters = undefined
  if (filter_params) filters = convertQueryParamsToFilters(filter_params)

  const keys = Object.keys(filter_params)
  console.log({ keys })
  if (keys.length == 1) {
    const __key = keys[0]
    switch (__key) {
      case 'email': {
        console.log('---> case 1-email')
        const { email, ...left_params } = filter_params
        if (filter_params) filters = convertQueryParamsToFilters(left_params)
        const text = filter_params[__key]
        const found_matches = (await queryIndex({
          tableName: process.env.TABLE_NAME,
          indexName: 'ByEmail2',
          pk: 'email',
          pv: text.trim(),
          filters: [['organizer', course]],
          limit: limit,
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        const arranged_data = sortData(found_matches.data)
        return res.status(200).json({
          resCode: "200",
          data: arranged_data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }

      case 'firstName': {
        const { firstName, ...left_params } = filter_params
        if (filter_params) filters = convertQueryParamsToFilters(left_params)
        const text = filter_params[__key]
        console.log('---> case 1-firstName')
        const found_matches = (await queryIndex({
          tableName: process.env.TABLE_NAME,
          indexName: 'ByFirstName2',
          pk: 'firstName',
          pv: text.trim(),
          filters: [['organizer', course]],
          limit: limit,
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        const arranged_data = sortData(found_matches.data)
        return res.status(200).json({
          resCode: "200",
          data: arranged_data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }

      case 'lastName': {
        const { lastName, ...left_params } = filter_params
        if (filter_params) filters = convertQueryParamsToFilters(left_params)
        const text = filter_params[__key]
        console.log('---> case 1-lastName')
        const found_matches = (await queryIndex({
          tableName: process.env.TABLE_NAME,
          indexName: 'ByLastName2',
          pk: 'lastName',
          pv: text.trim(),
          filters: [['organizer', course]],
          limit: limit,
          lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
        })) ?? []
        const arranged_data = sortData(found_matches.data)
        return res.status(200).json({
          resCode: "200",
          data: arranged_data,
          lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
        })
      }
      default:
        break
    }
  }
  else if (keys.length === 2) {
    if (keys.includes('firstName') && keys.includes('lastName')) {
      const { firstName, lastName } = filter_params
      console.log('---> case 5-firstName-lastName')
      const found_matches = (await queryIndex({
        tableName: process.env.TABLE_NAME,
        indexName: 'ByFirstNameLastName',
        pk: 'organizerFirstNameLastName',
        pv: `${course}#${firstName}#${lastName}`,
        filters: [],
        limit: limit,
        lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
      })) ?? []
      const arranged_data = sortData(found_matches.data)
      return res.status(200).json({
        resCode: "200",
        data: arranged_data,
        lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
      })
    }
    else if (keys.includes('firstName') && keys.includes('email')) {
      const { firstName, email } = filter_params
      console.log('---> case 5-firstName-email')
      const found_matches = (await queryIndex({
        tableName: process.env.TABLE_NAME,
        indexName: 'ByFirstNameEmail',
        pk: 'organizerFirstNameEmail',
        pv: `${course}#${firstName}#${email}`,
        filters: [],
        limit: limit,
        lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
      })) ?? []
      const arranged_data = sortData(found_matches.data)
      return res.status(200).json({
        resCode: "200",
        data: arranged_data,
        lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
      })
    }
    else if (keys.includes('lastName') && keys.includes('email')) {
      const { lastName, email } = filter_params
      console.log('---> case 5-lastName-email')
      const found_matches = (await queryIndex({
        tableName: process.env.TABLE_NAME,
        indexName: 'ByLastNameEmail',
        pk: 'organizerLastNameEmail',
        pv: `${course}#${lastName}#${email}`,
        filters: [],
        limit: limit,
        lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
      })) ?? []
      const arranged_data = sortData(found_matches.data)
      return res.status(200).json({
        resCode: "200",
        data: arranged_data,
        lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
      })
    }

  }
  else if (keys.length === 3) {
    const { firstName, lastName, email } = filter_params
      console.log('---> case 5-firstName-lastName-email')
      const found_matches = (await queryIndex({
        tableName: process.env.TABLE_NAME,
        indexName: 'ByFirstNameLastNameEmail',
        pk: 'organizerFirstNameLastNameEmail',
        pv: `${course}#${firstName}#${lastName}#${email}`,
        filters: [],
        limit: limit,
        lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
      })) ?? []
      const arranged_data = sortData(found_matches.data)
      return res.status(200).json({
        resCode: "200",
        data: arranged_data,
        lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
      })
  }
  else if (keys.length === 5) {
    const { firstName, lastName, email, from, to } = filter_params
      console.log('---> case all filter')
      const found_matches = (await queryIndexBetween({
        tableName: process.env.TABLE_NAME,
        indexName: 'ByFirstNameLastNameEmail',
        pk: 'organizerFirstNameLastNameEmail',
        pv: `${course}#${firstName}#${lastName}#${email}`,
        sk: 'timestamp',
        start: Number(from),
        end: Number(to),
        filters: [],
        limit: limit,
        lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
      })) ?? []
      const arranged_data = sortData(found_matches.data)
      return res.status(200).json({
        resCode: "200",
        data: arranged_data,
        lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
      })
  }
  else{
    console.log('---> case 4')
    const found_matches = (await queryIndex({
      tableName: process.env.TABLE_NAME,
      indexName: process.env.INDEX_ORGANIZER_BY_TIMESTAMP,
      pk: 'organizer',
      pv: course,
      limit: limit,
      filters: filters,
      lastEvaluatedKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined
    })) ?? []
    // console.log({ found_matches })
    const arranged_data = sortData(found_matches.data)
  
    return res.status(200).json({
      resCode: "200",
      data: arranged_data,
      lastEvaluatedKey: JSON.stringify(found_matches.lastEvaluatedKey)
    })
  }

}

