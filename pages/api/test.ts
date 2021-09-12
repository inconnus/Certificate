import type { NextApiRequest, NextApiResponse } from 'next'
export default async (req: NextApiRequest, res: NextApiResponse) => {
    return res.status(200).json({
        resCode: 200,
        data: [
            'ชื่อใจดี นามสกุลทุกคนก็ดีใจ',
            'ได้สำเร็จการฝึกอบรมโครงการ......................................................................................',
            'ให้ไว ณ วันที่ 00 ....................... พ.ศ. 0000',
        ]
    })
}

