process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndexSort } from "lib/DynamoDB"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, text }: any = req.query
  const found_matches = (await queryIndexSort({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_LASTNAME,
    pk: 'organizer',
    pv: course,
    sk: 'lastName',
    sv: text.toLowerCase().trim()
  })) ?? []
  return res.status(200).json({
    resCode: "200",
    data: found_matches
  })
}