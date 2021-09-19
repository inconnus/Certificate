process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndexBetween } from "lib/DynamoDB"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, from, to }: any = req.query
  const found_matches = (await queryIndexBetween({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_TIMESTAMP,
    pk: 'organizer',
    pv: course,
    sk: 'timestamp',
    start: Number(from),
    end: Number(to)
  })) ?? []
  return res.status(200).json({
    resCode: "200",
    data: found_matches
  })
}