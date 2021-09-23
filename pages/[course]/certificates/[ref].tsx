import { useRouter } from 'next/dist/client/router'
import React, { useRef, useEffect, useState, FC, useMemo } from 'react'
import styles from './ref.module.sass'
import { jsPDF } from "jspdf"
// var doc = new jsPDF("landscape");
import 'svg2pdf.js'
import html2canvas from 'html2canvas'
import useSWR from 'swr'
import axios from 'axios'
import PDFDocument from 'pdfkit'
import font from 'fonts/THSarabunNewBold'
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
const fetcher = (url: string) => axios.get(url).then(item => item.data.data)
const URL_MAPPTING = { '3dtelepringting': 'tele3dprinting.com', 'smartfactory': 'smartfactory.hcilab.net' }
const Ref = () => {
    // const data = useMemo(() => raw_data || [], [raw_data])
    const router = useRouter()
    const [zoom, setZoom] = useState<number>(1)
    const contentRef = useRef<HTMLDivElement>()
    const wrapRef = useRef<HTMLDivElement>()
    const svgElement = useRef()
    const textRef = useRef<SVGTextElement>()
    const [isSave, setIsSave] = useState<boolean>(false)
    const course: string = String(router.query.course)
    const { data } = useSWR(router.query.ref ? `/api/certificate/${router.query.ref}` : null, fetcher)
    // console.log(data);
    // console.log(router.query.ref);


    // const { data } = useSWR('/api/test', (url) => axios.get(url).then(res => res.data.data), { fallbackData: [] })
    const save = async () => {
        // const cloneNode: HTMLDivElement = contentRef.current.cloneNode(true)
        // cloneNode.id = 'save_layout'
        // cloneNode.style.maxWidth = 'none'
        // cloneNode.style.maxHeight = 'none'
        // cloneNode.style.height = '1748px'
        // cloneNode.style.width = '2480px'

        // wrapRef.current.appendChild(cloneNode)
        // computedStyleToInlineStyle(contentRef.current, {
        //     recursive: true,
        //     properties: ["font-size", "font-family", "font-weight"]
        // })
        const canvas = await html2canvas(contentRef.current)
        // wrapRef.current.appendChild(canvas)

        // wrapRef.current.appendChild(canvas)
        const doc = new jsPDF({
            format: 'a4',
            orientation: 'landscape',
            unit: 'px',
            compress: true
        })
        const width = screen.width
        // console.log(width);
        // wrapRef.current.offsetLeft
        // console.log(getComputedStyle(textRef.current).fontSize)
        // console.log(doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());


        // console.log(doc.internal.pageSize.getWidth());
        // return
        // doc.addFileToVFS("MyFont.ttf", font);
        // doc.addFont("/fonts/THSarabunNew Bold.ttf", "THSarabunNew Bold", "normal");
        // doc.setFont("THSarabunNew Bold");
        // doc.addImage(canvas, 'png', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight())
        // doc.setFontSize(29)
        // doc.text('สถาบันวิทยาการหุ่นยนต์ภาคสนาม', 0, 20)
        await doc.html(contentRef.current)
        doc.save()
    }
    console.log(router.query);

    return (
        <div className={styles.container}>
            <button className={styles.zoomin} onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}> <i className="fas fa-plus"></i></button>
            <button className={styles.zoomout} onClick={() => setZoom(Math.max(zoom - 0.1, 0.4))}> <i className="fas fa-minus"></i></button>
            <button className={styles.download} onClick={save}> <i className="fas fa-download"></i></button>
            {/* <button className={styles.download} onClick={() => setIsSave(true)}> <i className="fas fa-download"></i></button> */}
            {/* {isSave && <Preview isSave={isSave} setIsSave={setIsSave} data={sample_data} forSave={true} />} */}
            {/* <Preview data={sample_data} /> */}
            <div ref={wrapRef} className={styles.content_wrap}>
                <div ref={contentRef} style={{ transform: `scale(${zoom})` }} className={`${styles.content} `}>
                    {/* <Template /> */}
                    <img className={styles.template} src={`/images/template/${router.query.course}.png`} />
                    <svg ref={svgElement} viewBox='0 0 629 464' fill="#231F20" >
                        <text x="612" y="110" ref={textRef} fontSize={29} >สถาบันวิทยาการหุ่นยนต์ภาคสนาม</text>
                        <text x="612" y="148.75" style={{ fontSize: "29" }}>มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</text>
                        <text x="612" y="189.30" style={{ fontSize: "23" }}>ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</text>
                        <text x={612} y={239.41} fontSize={48}  >{`${data?.firstName || ''} ${data?.lastName || ''}`}</text>
                        <text x={612} y={281.81} fontSize={23} >{data?.wording1}</text>
                        <text x={612} y={309.57} fontSize={23} >{data?.wording2}</text>
                        <text x="038" y="437.79" style={{ fontSize: "12", textAnchor: 'start', fontFamily: "TH Sarabun New" }}>{`Verify at ${(URL_MAPPTING as any)[course]}/certificates/${router.query.ref}`}</text>
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

// import { GetServerSideProps } from 'next'
// export const getServerSideProps: GetServerSideProps = async (context) => {
//     const { course, ref } = context.params
//     const res = (await axios.get('https://jsonplaceholder.typicode.com/posts/1')).data
//     console.log(res);

//     return {
//         props: {
//             data: [
//                 'ชื่อใจดี นามสกุลทุกคนก็ดีใจ',
//                 'ได้สำเร็จการฝึกอบรมโครงการ......................................................................................',
//                 'ให้ไว ณ วันที่ 00 ....................... พ.ศ. 0000',
//             ]
//         },
//     }
// }