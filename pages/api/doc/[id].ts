process.env.TZ = "Asia/Bangkok"
import { query } from "lib/DynamoDB";
import { NextApiRequest, NextApiResponse } from "next";
import { accessKeyChecking } from "utils";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, key }: any = req.query
  if (!accessKeyChecking(key)) return res.status(200).json({ resCode: "400" })

  const doc_status = (await query({
    tableName: process.env.TABLE_NAME,
    pk: 'code',
    pv: id
  })).data[0] ?? {
    "status": 'PENDING'
  }
  console.log({ doc_status })
  return res.status(200).json(doc_status)
}