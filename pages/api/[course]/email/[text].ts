process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndexSort } from "lib/DynamoDB"
import { convertQueryParamsToFilters } from "utils"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, text, key, limit, ...another }: any = req.query
  let filters = undefined
  if (another) {
    filters = convertQueryParamsToFilters(another)
  }
  const found_matches = (await queryIndexSort({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_EMAIL,
    pk: 'organizer',
    pv: course,
    sk: 'email',
    sv: text.toLowerCase().trim(),
    filters: filters
  })) ?? []
  return res.status(200).json({
    resCode: "200",
    data: found_matches
  })
}