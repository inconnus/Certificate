import React, { ChangeEvent, FormEvent, useEffect, MouseEvent, useRef, useState, FC, useMemo, KeyboardEvent, useContext } from 'react'
import styles from './index.module.sass'
import Link from 'next/link'
import axios from 'axios'
import { useModal } from 'widgets/Modal'
import { useIntersection, useSWRScroll } from 'hooks'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import AppContext from 'contexts/app'
import DateRangePicker from 'react-bootstrap-daterangepicker';
const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5)


const DatePicker: FC<any> = ({ onChange }) => {
    const [dateText, setDateText] = useState({ from: '', to: '' })
    const fromRef = useRef(null)
    const toRef = useRef(null)
    const onInputChange = (e: ChangeEvent<HTMLInputElement>, key: string) => {
        const value = e.currentTarget.value
        console.log(key, fromRef.current.value);

        if (!fromRef.current.value || !toRef.current.value || dayjs(toRef.current.value).isBefore(dayjs(fromRef.current.value))) {
            toRef.current.value = value
            fromRef.current.value = value
            setDateText({ from: dayjs(value).format('DD/MM/YYYY'), to: dayjs(value).format('DD/MM/YYYY') })
        }
        else setDateText({ from: dayjs(fromRef.current.value).format('DD/MM/YYYY'), to: dayjs(toRef.current.value).format('DD/MM/YYYY') })
        // setDateText({ ...dateText, [key]: dayjs(value).format('DD/MM/YYYY') })
        onChange(dayjs(fromRef.current.value).unix(), dayjs(toRef.current.value).unix())
        console.log(dayjs(value).unix());

    }
    return (
        <div className={styles.date_picker}>
            <div className={styles.date}>
                <span>{dateText.from}</span>
                <input ref={fromRef} onChange={e => onInputChange(e, 'from')} style={{ width: '150px' }} type="date" />
            </div>
            <span style={{ margin: '0 5px', flexShrink: 0 }}>-</span>
            <div className={styles.date}>
                <span>{dateText.to}</span>
                <input ref={toRef} onChange={e => onInputChange(e, 'to')} style={{ width: '150px' }} type="date" />
            </div>

        </div>
    )
}
const Upload: FC<any> = ({ onSuccess }) => {
    const [text, setText] = useState('')
    const selectRef = useRef<HTMLSelectElement>()
    const fileRef = useRef<HTMLInputElement>()
    const passwordRef = useRef<HTMLInputElement>()
    const { loading: [loading, setLoading], notify } = useContext(AppContext)

    const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files.length) return
        setText(e.currentTarget.files[0].name)
        // notify.current.push('ad')
    }
    const onUpload = async (e: MouseEvent<HTMLButtonElement>) => {
        setLoading(true)
        const presignRes = await axios.get(`/api/getPresignedUrl?team=${selectRef.current.value}&key=${passwordRef.current.value}&ext=${fileRef.current.files[0].name.split('.').slice(-1)[0]}`)
        if (!presignRes.data.url) {
            setLoading(false)
            return notify.current.push('รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง', 'error')
        }
        const docId = presignRes.data.docId
        console.log(presignRes.data);

        const config = {
            headers: {
                "x-amz-acl": "public-read",
                "Content-Type": fileRef.current.files[0].type
            },
            onUploadProgress: (event: any) => {
                console.log(event);
            }
        }
        const uploadRes = await axios.put(presignRes.data.url, fileRef.current.files[0], config)
        const interval = setInterval(async () => {
            const status = await axios.get(`/api/doc/${docId}?key=${passwordRef.current.value}`)
            if (status.data.status === 'SUCCESS') {
                clearInterval(interval)
                setLoading(false)
                notify.current.push('อัพโหลดสำเร็จ!')
                fileRef.current.value = ''
                onSuccess(passwordRef.current.value, selectRef.current.value)
            }
            if (status.data.status === 'ERROR') {
                clearInterval(interval)
                setLoading(false)
                notify.current.push('ข้อมูลไม่ถูกต้อง กรุณาลองอีกครั้ง', 'error')
            }

            // console.log()
        }, 500)
        // notify.current.open('ad')

        // return


        // console.log(uploadRes);
    }
    useEffect(() => {
        const team = localStorage.getItem('TEAM')
        if(!team) return
        selectRef.current.value = team
    }, [])
    return (
        <div className={styles.import}>
            <span style={{ fontSize: '1.2em' }}>นำเข้ารายชื่อ</span>
            <div className={styles.upload}>
                <div style={{ alignItems: 'center' }}>
                    <label htmlFor='upload'>เลือกไฟล์</label>
                    <input ref={fileRef} id='upload' onChange={onChange} type='file' accept='.xlsx,.xls' />
                    <span>{text ? text : 'ไม่ได้เลือกไฟล์'}</span>
                </div>
                <label>*.xls,*.xlsx</label>
            </div>
            <div className={styles.template}>
                <Link href='https://certificate-generator.s3.ap-southeast-1.amazonaws.com/template.xlsx'>
                    <a>ไฟล์ Template (*xlsx) สำหรับส่งรายชื่อเข้าสู่ระบบ</a>
                </Link>
            </div>
            <div className={styles.confirm} style={{ flexShrink: 0, display: 'flex' }}>
                <select ref={selectRef} name='team' >
                    <option value='smartfactory'>Smart Factory</option>
                    <option value='3dtelepringting'>Tele-3D Printing</option>
                </select>
                <input ref={passwordRef} name='password' type='password' placeholder='Password' />
                <button disabled={!text} onClick={onUpload}>
                    <i className="fas fa-upload"></i>
                    <span>อัพโหลด</span>
                </button>
            </div>

        </div>
    )
}

interface Filter {
    firstName: string,
    lastName: string,
    email: string,
    timestamp: string,
    trainingTopic: string,
    from: number,
    to: number
}
const filterHandler = (filter: Filter, currentCourse: string, currentKey: string) => {
    const data = Object.entries(filter)
    const hasValue = data.filter(item => item[1])
    const optionalStringQuery = hasValue.reduce((sum, cur) => sum += `${cur[0]}=${cur[1]}&`, '').slice(0, -1)
    let path = `/api/${currentCourse}/search?key=${currentKey}`
    if (optionalStringQuery) path += `&${optionalStringQuery}`
    return path
}
const index = () => {
    const [ModalWrapper, modal, setModal] = useModal()
    const isScrolling = useRef<boolean>(false)
    const [isScroll, setIsScroll] = useState(false)
    const [isStart, setStart] = useState(false)
    const [error, setError] = useState(false)
    const { loading: [loading, setLoading], notify } = useContext(AppContext)
    const [filter, setFilter] = useState<Filter>({
        firstName: '',
        lastName: '',
        email: '',
        timestamp: '',
        trainingTopic: '',
        from: null,
        to: null
    })
    const [filterTimer, setFilterTimer] = useState<NodeJS.Timeout>()
    const [currentCourse, setCurrentCourse] = useState('')
    const [currentKey, setCurrentKey] = useState('')
    const [isExport, setExport] = useState(false)
    const selectRef = useRef<HTMLSelectElement>()
    const passwordRef = useRef<HTMLInputElement>()
    const { swr: { data: rawData, size, setSize, isValidating }, contetnIntersecRef: conRef } = useSWRScroll(currentKey ? (filterHandler(filter, currentCourse, currentKey)) : null, { limit: 50 })
    const data = useMemo(() => rawData && rawData.flatMap(item => item.data), [rawData])
    const [pageInterRef, contetnIntersecRef] = useIntersection(async (entries: IntersectionObserverEntry[]) => {
        const ratio = entries[0].intersectionRatio
        if (!ratio) setIsScroll(true)
        else setIsScroll(false)
    }, [])
    useEffect(() => {
        if (!data) return
        if (!data.every(item => item)) {
            setError(true)
            setStart(false)
            // console.log('error');
        }
        else setError(false)
        console.log(data);

    }, [data])
    useEffect(() => {
        (async () => {
            if (!isExport) return
            if (isValidating) return
            const res = await axios.post(`/api/export/${currentCourse}`, data)
            location.href = res.data.path
            setLoading(false)
            setExport(false)
            console.log(res.data);
        })()
    }, [isValidating, isExport])
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
    const onDateChange = (from: number, to: number) => {
        setFilter({ ...filter, from, to })
    }
    const onSearch = (e: ChangeEvent<HTMLInputElement>, key: string) => {
        const text = e.currentTarget.value
        clearTimeout(filterTimer)
        setFilterTimer(setTimeout(() => {
            setFilter({ ...filter, [key]: text })
        }, 500))
    }
    const onQuery = () => {
        const password = passwordRef.current.value
        const team = selectRef.current.value
        setCurrentCourse(team)
        setCurrentKey(password)
        if (passwordRef.current.value === currentKey) return
        setStart(true)
        // console.log(location);

    }
    const onKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onQuery()
    }
    const onImport = (e: MouseEvent<HTMLButtonElement>) => {
        setModal({ name: 'import' })
    }
    const onExport = async (e: MouseEvent<HTMLButtonElement>) => {
        if (!data?.length) return notify.current.push('ไม่พบข้อมูล กรุณาลองอีกครั้ง', 'error')
        setLoading(true)
        setSize(9999)
        setExport(true)
    }
    const onTeamChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value
        setCurrentCourse(value)
        pageInterRef.current.scrollTop = 0
        localStorage.setItem('TEAM', value)
    }
    const onUploadSuccess = (password: string, team: string) => {
        setModal({})
        selectRef.current.value = team
        passwordRef.current.value = password
        onQuery()
    }
    useEffect(() => {
        const team = localStorage.getItem('TEAM')
        if (!team) return
        selectRef.current.value = team
    }, [])
    return (
        <div className={styles.page}>
            <ModalWrapper name='import'>
                <Upload onSuccess={onUploadSuccess} />
            </ModalWrapper>
            <div className={styles.header}>
                <span>ข้อมูล Cerificate</span>
            </div>
            {/* <button onClick={onUpload}>dd</button> */}
            <div className={styles.console}>
                <div style={{ flexShrink: 0 }}>
                    <button onClick={onImport}>
                        <i className="fas fa-file-import"></i>
                        <span>นำเข้าไฟล์</span>
                    </button>

                </div>
                {/* <form id='query'> */}
                <div style={{ flexShrink: 0, display: 'flex' }}>
                    <button style={{ background: '#0E324C', marginRight: '10px' }} onClick={onExport}>
                        <i className="fas fa-file-excel"></i>
                        <span>Download as Excel</span>
                    </button>
                    <select onChange={onTeamChange} ref={selectRef} name='team' >
                        <option value='smartfactory'>Smart Factory</option>
                        <option value='3dtelepringting'>Tele-3D Printing</option>
                    </select>
                    <input onKeyUp={onKeyUp} ref={passwordRef} name='password' type='password' placeholder='Password' />
                    <button onClick={onQuery}>
                        <i className="fas fa-search"></i>
                        <span>ค้นหา</span>
                    </button>
                </div>
                {/* </form> */}
                {/* <input id='upload' onChange={onUpload} type='file' accept='.xlsx,.xls' />
                <label htmlFor='upload'>d</label> */}

            </div>
            <div ref={pageInterRef} className={styles.table_container}>

                <div className={styles.item}>
                    <div className={styles.fixed} >#</div>
                    <div className={styles.fixed} >
                        <span>ชื่อ</span>
                        <input onChange={e => onSearch(e, 'firstName')} />
                    </div>
                    <div className={styles.fixed} >
                        <span>นามสกุล</span>
                        <input onChange={e => onSearch(e, 'lastName')} />
                    </div>
                    <div className={styles.fixed} >
                        <span> ชื่อกิจกรรม</span>
                        <input onChange={e => onSearch(e, 'trainingTopic')} />
                    </div>
                    <div className={styles.fixed} >
                        <span> วันที่ออกใบประกาศ</span>
                        <DatePicker onChange={(from: number, to: number) => onDateChange(from, to)} />
                        {/* <input style={{width:'150px'}} type="date" id="birthday" name="birthday"/> */}
                        {/* <input onChange={e => onSearch(e, 'timestamp')} /> */}
                    </div>
                    <div className={styles.fixed} >
                        <span>  Email</span>
                        <input onChange={e => onSearch(e, 'email')} />
                    </div>
                    <div className={styles.flexible} >
                        <span>  URL</span>
                        {/* <input /> */}
                    </div>
                </div>
                {!currentKey && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>กรุณาใส่รหัสผ่านเพื่อค้นหา</span>}
                {error && !isStart && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>รหัสผ่านไม่ถูกต้อง</span>}
                {!error && currentKey && isStart && !data && !isValidating && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>ไม่พบรายการ</span>}

                {data?.every(item => item) && data?.map((item, index) => (
                    <div key={index} className={styles.item}>
                        <div className={styles.fixed}><span>{index + 1}</span></div>
                        <div className={styles.fixed}><span>{item.firstName}</span></div>
                        <div className={styles.fixed}><span>{item.lastName}</span></div>
                        <div className={styles.fixed}><span>{item.trainingTopic}</span></div>
                        <div className={styles.fixed}><span>{dayjs.unix(item.timestamp).locale('th').format('DD MMMM YYYY')}</span></div>
                        <div className={styles.fixed}><span>{item.email}</span></div>
                        <div className={styles.flexible}>
                            <Link href={`${location.href}${item.organizer}/certificates/${item.code}`}>
                                <a target="_blank">{`${location.href}${item.organizer}/certificates/${item.code}`}</a>
                            </Link>
                        </div>
                    </div>
                ))}
                {isValidating && isStart && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>กำลังค้นหา...</span>}
                <div style={{ display: data && data?.every(item => item) ? 'flex' : 'none' }} className={styles.loader_item} ref={conRef} />
                <div style={{ position: 'absolute', left: 0, height: '45px', top: '0' }} ref={contetnIntersecRef} />
            </div>
            {isScroll && <button onClick={scrollTop} className={styles.scroll_top_btn}>
                <img src='/images/up.svg' />
            </button>}
        </div>
    )
}

export default index
