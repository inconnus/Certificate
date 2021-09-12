import { useRouter } from 'next/dist/client/router'
import React, { useRef, useEffect, useState, FC, useMemo } from 'react'
import styles from './ref.module.sass'
import { jsPDF } from "jspdf"
// var doc = new jsPDF("landscape");
import 'svg2pdf.js'
import html2canvas from 'html2canvas'
import useSWR from 'swr'
import axios from 'axios'
// 
const Preview: FC<{ data: string[], forSave?: boolean, isSave?: boolean, setIsSave?: any }> = ({ data, forSave = false, isSave, setIsSave }: any) => {
    const router = useRouter()
    const contentRef = useRef<any>()
    // const { data } = useSwr('https://jsonplaceholder.typicode.com/posts/1')
    useEffect(() => {

        (async () => {
            if (!isSave) return
            const canvas = await html2canvas(contentRef.current)
            var imgData = canvas.toDataURL("image/jpeg", 1.0)
            var pdf = new jsPDF({
                orientation: 'landscape',
                format: 'a5',
                compress: true
            })
            pdf.addImage(imgData, 'JPG', 0, 0, 210, 148)
            pdf.save("HTML-Document.pdf")
            setIsSave(false)
        })()
    }, [isSave])
    return (
        <div className={styles.content_wrap}>
            <div className={`${styles.content} ${forSave ? styles.save : ''} `}>
                <img src='/images/template.png' />
                <span style={{ right: '3.7vh', top: '20.4vh', fontSize: '6.4vh' }}>สถาบันวิทยาการหุ่นยนต์ภาคสนาม</span>
                <span style={{ right: '3.7vh', top: '28.1vh', fontSize: '6.4vh' }}>มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</span>
                <span style={{ right: '3.7vh', top: '37.67vh', fontSize: '5.07vh' }}>ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</span>
                <span style={{ right: '3.7vh', top: '45.1vh', fontSize: '10.55vh' }}>{data[0]}</span>
                <span style={{ right: '3.7vh', top: '58.5vh', fontSize: '5.07vh' }}>{data[1]}</span>
                <span style={{ right: '3.7vh', top: '64.5vh', fontSize: '5.07vh' }}>{data[2]}</span>
                <span className={styles.normal} style={{ left: '7.5vh', top: '94.67vh', fontSize: '2.64vh' }}>{`Verify at smartfactory.hcilab.net/certificates/${router.query.ref}`}</span>
            </div>
        </div>
    )
}
interface TextLoader { x: number, y: number, size: number, w: number, text: string }
const TextLoader = ({ x, y, size, w, text }: TextLoader) => {
    return (
        <svg x={x} y={y} >
            {/* {text ? <text style={{ fontSize: `${size}px` }}>{text}</text> :
                <rect className='loader' transform={`translate(${-w},${(-size * 0.8) + 3})`} x="0" y="0" rx={size * 0.8 / 2} height={size * 0.8} width={w} fill="#b2b2b2" /> */}
            <text style={{ fontSize: `${size}px` }}>{text}</text>
        </svg>
    )
    // <rect transform={`translate(${-w},${-h - 2})`} x="0" y="0" rx={h / 2} height={h} width={w} fill="#b2b2b2" />
}

interface Ref { data: string[] }
const Ref = ({ data }: Ref) => {
    // const data = useMemo(() => raw_data || [], [raw_data])
    const router = useRouter()
    const [zoom, setZoom] = useState(1)
    const [isSave, setIsSave] = useState<boolean>(false)
    // const { data } = useSWR('/api/test', (url) => axios.get(url).then(res => res.data.data), { fallbackData: [] })
    const save = () => {
        // const doc = new jsPDF({
        //     format: 'a5',
        //     orientation: 'landscape'
        // })
        // doc.addFont()

        // const element = document.getElementById('template')
        // doc
        //     .svg(element, {
        //         x: 0,
        //         y: 0,
        //         width: 100,
        //         height: 100
        //     })
        //     .then(() => {
        //         // save the created pdf
        //         doc.save('myPDF.pdf')
        //     })
    }
    return (
        <div className={styles.container}>
            <button className={styles.zoomin} onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}> <i className="fas fa-plus"></i></button>
            <button className={styles.zoomout} onClick={() => setZoom(Math.max(zoom - 0.1, 0.4))}> <i className="fas fa-minus"></i></button>
            <button className={styles.download} onClick={save}> <i className="fas fa-download"></i></button>
            {/* <button className={styles.download} onClick={() => setIsSave(true)}> <i className="fas fa-download"></i></button> */}
            {/* {isSave && <Preview isSave={isSave} setIsSave={setIsSave} data={sample_data} forSave={true} />} */}
            {/* <Preview data={sample_data} /> */}
            <div className={styles.content_wrap}>
                <div style={{ transform: `scale(${zoom})` }} className={`${styles.content} `}>
                    {/* <Template /> */}
                    <img src='/images/template.png' />
                    <svg viewBox="0 0 630 454" fill="#231F20" >
                        <text x="612" y="113.75" style={{ fontSize: "29" }}>สถาบันวิทยาการหุ่นยนต์ภาคสนาม</text>
                        <text x="612" y="148.75" style={{ fontSize: "29" }}>มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</text>
                        <text x="612" y="189.30" style={{ fontSize: "23" }}>ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</text>
                        <TextLoader x={612} y={239.41} w={350} size={48} text={data[0]} />
                        <TextLoader x={612} y={281.81} w={400} size={23} text={data[1]} />
                        <TextLoader x={612} y={309.57} w={200} size={23} text={data[2]} />
                        <text x="038" y="437.79" style={{ fontSize: "12", textAnchor: 'start', fontFamily: "TH Sarabun New" }}>{`Verify at smartfactory.hcilab.net/certificates/${router.query.ref}`}</text>
                    </svg>
                    {/* <span style={{ right: '3.7vh', top: '20.4vh', fontSize: '6.4vh' }}>สถาบันวิทยาการหุ่นยนต์ภาคสนาม</span>
                    <span style={{ right: '3.7vh', top: '28.1vh', fontSize: '6.4vh' }}>มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</span>
                    <span style={{ right: '3.7vh', top: '37.67vh', fontSize: '5.07vh' }}>ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</span>
                    <span style={{ right: '3.7vh', top: '45.1vh', fontSize: 'calc(10.55vh + 1vw)' }}>{data[0]}</span>
                    <span style={{ right: '3.7vh', top: '58.5vh', fontSize: '5.07vh' }}>{data[1]}</span>
                    <span style={{ right: '3.7vh', top: '64.5vh', fontSize: '5.07vh' }}>{data[2]}</span>
                    <span className={styles.normal} style={{ left: '7.5vh', top: '94.67vh', fontSize: '2.64vh' }}>{`Verify at smartfactory.hcilab.net/certificates/${router.query.ref}`}</span> */}
                </div>
            </div>

        </div>
    )
}

export default Ref

import { GetServerSideProps } from 'next'
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { course, ref } = context.params
    const res = (await axios.get('https://jsonplaceholder.typicode.com/posts/1')).data
    console.log(res);
    
    return {
        props: {
            data: [
                'ชื่อใจดี นามสกุลทุกคนก็ดีใจ',
                'ได้สำเร็จการฝึกอบรมโครงการ......................................................................................',
                'ให้ไว ณ วันที่ 00 ....................... พ.ศ. 0000',
            ]
        },
    }
}