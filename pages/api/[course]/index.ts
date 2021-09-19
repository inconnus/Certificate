process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { queryIndex } from "lib/DynamoDB"
import { accessKeyChecking } from "utils"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, key }: any = req.query
  if (!accessKeyChecking(key)) return res.status(200).json({ resCode: "400" })
  const found_matches = (await queryIndex({
    tableName: process.env.TABLE_NAME,
    indexName: process.env.INDEX_EMAIL,
    pk: 'organizer',
    pv: course,
  })).data ?? []
  return res.status(200).json({
    resCode: "200",
    data: found_matches
  })
}