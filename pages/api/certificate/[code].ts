process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { query } from "lib/DynamoDB"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { code }: any = req.query
  console.log(code);
  
  const cert = (await query({
    tableName: process.env.TABLE_NAME,
    pk: 'code',
    pv: code
  })).data[0] ?? {}
  return res.status(200).json({
    resCode: "200",
    data: cert
  })
}