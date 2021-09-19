process.env.TZ = "Asia/Bangkok"
import { NextApiRequest, NextApiResponse } from "next"
import { S3 } from 'aws-sdk'
import { ulid } from 'ulid'

const region = 'ap-southeast-1';
const s3 = new S3({
  region: region
})

const BUCKET_NAME = 'certificate-generator'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { team, ext }: any = req.query
  let signed: any

  const id = ulid()

  const root_path = `${BUCKET_NAME}/${team}`
  try {
    s3.createPresignedPost({
      Fields: {
        key: id,
        ACL: "public-read",
      },
      Expires: 30,
      Bucket: `${root_path}/input/${id}.${ext}`
    }, (err, response) => {
      if (err) {
        console.log("Error create presigned post")
        console.log(err)
        return res.status(500).json(signed)
      }
      signed = response
    })
  }
  catch (err) {
    console.log("Error create presigned post")
    console.log(err)
    return res.status(500).json(signed)
  }
  console.log('---> Here', signed)
  return res.status(200).json({ url: signed.url })
}