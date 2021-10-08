import { useRouter } from 'next/dist/client/router'
import React, { useRef, useEffect, useState, FC, useMemo, useContext } from 'react'
import styles from './ref.module.sass'
import useSWR from 'swr'
import axios from 'axios'
import AppContext from 'contexts/app'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

interface Ref { data: string[] }
const fetcher = (url: string) => axios.get(url).then(item => item.data.data)
const URL_MAPPTING = { 'tele3dprinting': 'tele3dprinting.com', 'smartfactory': 'smartfactory.hcilab.net' }
const Ref = () => {
    // const data = useMemo(() => raw_data || [], [raw_data])
    const { loading: [loading, setLoading] } = useContext(AppContext)
    const router = useRouter()
    const [zoom, setZoom] = useState<number>(1)
    const contentRef = useRef<HTMLDivElement>()
    const wrapRef = useRef<HTMLDivElement>()
    const svgElement = useRef()
    const textRef = useRef<SVGTextElement>()
    const [isSave, setIsSave] = useState<boolean>(false)
    const course: string = String(router.query.course)
    const { data } = useSWR(router.query.ref ? `/api/certificate/${router.query.ref}` : null, fetcher)
    const fileRef = useRef<any>()
    const intervalRef = useRef<any>()
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (!data) return
        (async () => {
            if (!data.code) return
            setShow(true)
            const res = await axios.post('/api/pdfGenerator', {
                name: `${data.firstName} ${data.lastName}`,
                text1: `${data.text1}`,
                text2: `${data.text2}`,
                date: `ให้ไว้ ณ วันที่ ${dayjs.unix(data?.timestamp).add(543, 'year').locale('th').format('D MMMM พ.ศ. YYYY')}`,
                code: data.code,
                organizer: data.organizer
            }, {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                }
            })
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
            fileRef.current = url
        })()

    }, [data])
    const save = async () => {
        setLoading(true)
        const inter = () => {
            if (!fileRef.current) return
            const link = document.createElement('a')
            link.href = fileRef.current
            link.setAttribute('download', `${router.query.ref}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            clearInterval(intervalRef.current)
            setLoading(false)
        }
        intervalRef.current = setInterval(inter, 500)
    }
    if (!data) return <span className={styles.loading}>กำลังโหลด...</span>
    if (!data.code) return <span className={styles.loading}>ไม่พบข้อมูล</span>
    return (
        <div className={styles.container}>
            {/* <button className={styles.zoomin} onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}> <i className="fas fa-plus"></i></button>
            <button className={styles.zoomout} onClick={() => setZoom(Math.max(zoom - 0.1, 0.4))}> <i className="fas fa-minus"></i></button> */}
            <button className={styles.download} onClick={save}> <i className="fas fa-download"></i></button>
            {/* <button className={styles.download} onClick={() => setIsSave(true)}> <i className="fas fa-download"></i></button> */}
            {/* {isSave && <Preview isSave={isSave} setIsSave={setIsSave} data={sample_data} forSave={true} />} */}
            {/* <Preview data={sample_data} /> */}
            <div ref={wrapRef} className={styles.content_wrap}>
                <div ref={contentRef} style={{ transform: `scale(${zoom})` }} className={`${styles.content} `}>
                    {/* <Template /> */}
                    <img className={styles.template} src={`/images/template/${router.query.course}.png`} />
                    <svg ref={svgElement} viewBox='0 0 629 464' fill="#231F20" >
                        <text x="625" y="110" ref={textRef} fontSize={29} >สถาบันวิทยาการหุ่นยนต์ภาคสนาม</text>
                        <text x="625" y="148.75" style={{ fontSize: "29" }}>มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</text>
                        <text x="625" y="189.30" style={{ fontSize: "23" }}>ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</text>
                        {data && <>
                            <text x={625} y={239.41} fontSize={48}  >{`${data?.firstName || ''} ${data?.lastName || ''}`}</text>
                            <text x={625} y={281.81} fontSize={23} >{data?.text1}</text>
                            <text x={625} y={315} fontSize={23} >{data?.text2}</text>
                            <text x={625} y={data?.text2 ? 349 : 315} fontSize={23} >{`ให้ไว้ ณ วันที่ ${dayjs.unix(data?.timestamp).add(543, 'year').locale('th').format('D MMMM พ.ศ. YYYY')}`}</text>
                        </>}
                        <text x="20" y="452" style={{ fontSize: "12", textAnchor: 'start', fontFamily: "TH Sarabun New" }}>{`Verify at ${(URL_MAPPTING as any)[course]}/certificates/${router.query.ref}`}</text>
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