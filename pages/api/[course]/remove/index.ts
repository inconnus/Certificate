process.env.TZ = "Asia/Bangkok"
import { removeItem } from "lib/DynamoDB"
import { NextApiRequest, NextApiResponse } from "next"
import { accessKeyChecking } from "utils"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { course, key }: any = req.query
  const { codes }: any = req.body

  if (!accessKeyChecking(key)) return res.status(200).json({ resCode: "400" })

  await Promise.all(codes.map(async (code: any) => await removeItem({
    tableName: process.env.TABLE_NAME,
    pk: 'code',
    pv: code
  })))

  return res.status(200).json({ resCode: "200" })

}