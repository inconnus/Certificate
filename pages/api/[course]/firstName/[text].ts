process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndexSort } from "lib/DynamoDB"
import { accessKeyChecking, convertQueryParamsToFilters } from "utils"


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, text, key, limit, ...another }: any = req.query
  if (!accessKeyChecking(key)) return res.status(200).json({ resCode: "400" })
  let filters = undefined
  if (another) filters = convertQueryParamsToFilters(another)
  const found_matches = (await queryIndexSort({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_FIRSTNAME,
    pk: 'organizer',
    pv: course,
    sk: 'firstName',
    sv: text.toLowerCase().trim(),
    // filters: [['lastName', 'มานะมั่นชัยพร'], ['email', 'im.arsapol@gmail.com']]
    filters: filters
  })) ?? []
  return res.status(200).json({
    resCode: "200",
    data: found_matches
  })
}