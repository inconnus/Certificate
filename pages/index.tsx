import React, { ChangeEvent, FormEvent, useEffect, MouseEvent, useRef, useState } from 'react'
import styles from './index.module.sass'
import Link from 'next/link'
import axios from 'axios'
import { useModal } from 'widgets/Modal'
import { useIntersection } from 'hooks'
const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5)
const index = () => {
    const [ModalWrapper, modal, setModal] = useModal()
    const isScrolling = useRef<boolean>(false)
    const [isScroll, setIsScroll] = useState(false)
    const selectRef = useRef<HTMLSelectElement>()
    const passwordRef = useRef<HTMLInputElement>()
    const [pageInterRef, contetnIntersecRef] = useIntersection(async (entries: IntersectionObserverEntry[]) => {
        const ratio = entries[0].intersectionRatio
        if (!ratio) setIsScroll(true)
        else setIsScroll(false)
    }, [])
    const scrollTop = () => {
        isScrolling.current = true
        const pos = pageInterRef.current.scrollTop
        const start = performance.now()
        const step = (timestamp: number) => {
            const time = timestamp - start
            const percent = time / 1000
            if (percent >= 1) return pageInterRef.current.scrollTop = 0
            if (!isScrolling.current) return
            pageInterRef.current.scrollTop = pos - (pos * easeOutQuint(percent))
            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }
    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files.length) return
        const res = await axios.get(`/api/getPresignedUrl?team=smartfactory&ext=${e.target.files[0].name.split('.')[1]}`)
        const url = res.data.url
        const config = {
            headers: {
                "x-amz-acl": "public-read",
                "Content-Type": e.target.files[0].type
            },
            onUploadProgress: (event: any) => {
                console.log(event);
            }
        }
        e.target.value = ''
        const resx = await axios.put(url, e.target.files[0], config)
    }
    const onQuery = (e: ChangeEvent<HTMLButtonElement>) => {
        const password = passwordRef.current.value
        const team = selectRef.current.value
        console.log(password, team);
    }
    const onImport = (e: MouseEvent<HTMLButtonElement>) => {
        setModal({ name: 'import' })
    }
    const onTeamChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value
        localStorage.setItem('TEAM', value)
    }
    useEffect(() => {
        const team = localStorage.getItem('TEAM')
        selectRef.current.value = team
    }, [])
    return (
        <div className={styles.page}>
            <ModalWrapper name='import'>
                <div className={styles.import}>
                    a
                </div>
            </ModalWrapper>
            <div className={styles.header}>
                <span>ข้อมูล Cerificate</span>
            </div>
            {/* <button onClick={onUpload}>dd</button> */}
            <div className={styles.console}>
                <button onClick={onImport}>
                    <i className="fas fa-file-import"></i>
                    <span>นำเข้าไฟล์</span>
                </button>
                <div style={{ flexShrink: 0, display: 'flex' }}>
                    <select onChange={onTeamChange} ref={selectRef} name='team' >
                        <option value='smartfactory'>Smart Factory</option>
                        <option value='tele'>Tele-3D Printing</option>
                    </select>
                    <input ref={passwordRef} name='password' type='password' placeholder='Password' />
                    <button onClick={onQuery}>
                        <i className="fas fa-search"></i>
                        <span>ค้นหา</span>
                    </button>
                </div>
                {/* <input id='upload' onChange={onUpload} type='file' accept='.xlsx,.xls' />
                <label htmlFor='upload'>d</label> */}

            </div>
            <div ref={pageInterRef} className={styles.table_container}>

                <div className={styles.item}>
                    <div className={styles.fixed} >#</div>
                    <div className={styles.fixed} >
                        <span>ชื่อ</span>
                        <input />
                    </div>
                    <div className={styles.fixed} >
                        <span>นามสกุล</span>
                        <input />
                    </div>
                    <div className={styles.fixed} >
                        <span> ชื่อกิจกรรม</span>
                        <input />
                    </div>
                    <div className={styles.fixed} >
                        <span> วันที่ออกใบประกาศ</span>
                        <input />
                    </div>
                    <div className={styles.fixed} >
                        <span>  Email</span>
                        <input />
                    </div>
                    <div className={styles.flexible} >
                        <span>  URL</span>
                        <input />
                    </div>
                </div>

                {[...Array(50)].map((item, index) => (
                    <div key={index} className={styles.item}>
                        <div className={styles.fixed}><span>{index + 1 * 10}</span></div>
                        <div className={styles.fixed}><span>Chindanai</span></div>
                        <div className={styles.fixed}><span>Mala-eiam</span></div>
                        <div className={styles.fixed}><span>Iot Devlelopment</span></div>
                        <div className={styles.fixed}><span>48 Dec 2048</span></div>
                        <div className={styles.fixed}><span>chindanai.mal@gmail.com</span></div>
                        <div className={styles.flexible}>
                            <Link href={'https://smartfactory.hcilab.net/certificates/sAldkwosdqqwdqwd'}>
                                <a>https://smartfactory.hcilab.net/certificates/sAldkwosdqqwdqwd</a>
                            </Link>
                        </div>
                    </div>
                ))}
                <div style={{ position: 'absolute', left: 0, height: '45px', top: '0' }} ref={contetnIntersecRef} />
            </div>
            {isScroll && <button onClick={scrollTop} className={styles.scroll_top_btn}>
                <img src='/images/up.svg' />
            </button>}
        </div>
    )
}

export default index
