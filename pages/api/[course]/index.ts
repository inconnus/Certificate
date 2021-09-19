process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndex } from "lib/DynamoDB"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course }: any = req.query
  const found_matches = (await queryIndex({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_EMAIL,
    pk: 'organizer',
    pv: course,
  })) ?? []
  return res.status(200).json({
    resCode: "200",
    data: found_matches
  })
}