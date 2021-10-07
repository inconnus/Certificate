import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import blobStream from 'blob-stream'
import PDFDocument from 'pdfkit'
const URL_MAPPTING = { '3dtelepringting': 'tele3dprinting.com', 'smartfactory': 'smartfactory.hcilab.net' }
const width = 841.89
const height = 595.28
const pad = width - 40
export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, text1, text2, date, code, organizer } = req.body
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' })
    doc.pipe(res)
    doc.image(`https://certificate-navy.vercel.app/images/template/${organizer}.png`, 0, 0, { width: width, height: height })
    // doc.image(`public/images/template/${organizer}.png`, 0, 0, { width: width, height: height })
    doc.font('https://certificate-navy.vercel.app/fonts/THSarabunNew Bold.ttf')
    doc.fontSize(37)
    doc.text('สถาบันวิทยาการหุ่นยนต์ภาคสนาม', 0, 109.63, { width: pad, align: 'right' })
    doc.text('มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี', 0, 159.34, { width: pad, align: 'right' })
    doc.fontSize(61.5).text(name, 0, 255.16, { width: pad, align: 'right' })
    doc.fontSize(29.5)
    doc.text('ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า', 0, 217.88, { width: pad, align: 'right' })
    doc.text(text1, 0, 336.55, { width: pad, align: 'right' })
    doc.text(text2, 0, 379.13, { width: pad, align: 'right' })
    doc.text(date, 0, text2 ? 422.75 : 379.13, { width: pad, align: 'right' })

    doc.fontSize(15.4)
    doc.font('https://certificate-navy.vercel.app/fonts/THSarabunNew.ttf')
    doc.text(`Verify at ${URL_MAPPTING[organizer]}/certificates/${code}`, 67, 548.68, { height: 1 }).link(67, 548.68, 250, 14, `https://${URL_MAPPTING[organizer]}/certificates/${code}`)
    doc.end()
    doc.on('end', () => {
        // console.log('end');


        // let pdfData = Buffer.concat(buffers);
        // res.writeHead(200, {
        //     'Content-Length': Buffer.byteLength(pdfData),
        //     'Content-Type': 'application/pdf',
        //     // 'Content-disposition': 'attachment;filename=test.pdf',
        // }).end(pdfData)
        // res.send(pdfData)

    });
    // return res.status(200).json({
    //     resCode: 200,
    //     data: [
    //         'ชื่อใจดี นามสกุลทุกคนก็ดีใจ',
    //         'ได้สำเร็จการฝึกอบรมโครงการ......................................................................................',
    //         'ให้ไว ณ วันที่ 00 ....................... พ.ศ. 0000',
    //     ]
    // })
}

