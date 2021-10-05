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
import Checkbox from 'widgets/Checkbox'
import { bool } from 'aws-sdk/clients/signer'
import { mutate } from 'swr'
import DateRange from 'widgets/DateRange'
import { createPortal } from 'react-dom'
const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5)


const DatePicker: FC<any> = ({ onChange, setFocus, focus, rangeDate, setRangeDate }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const mousedown = () => {
            setFocus(false)
        }
        if (focus) addEventListener('mousedown', mousedown)
        else removeEventListener('mousedown', mousedown)
    }, [focus])
    const onDateChange = (date: dayjs.Dayjs[]) => {
        if (!date?.length) return
        if (onChange) {
            onChange(date)
            setRangeDate(date)
            inputRef.current.value = `${date[0].format('DD/MM/YY')} - ${date[1].format('DD/MM/YY')}`
        }
    }
    return (
        <div onMouseDown={e => e.stopPropagation()} className={styles.date_picker}>
            <input ref={inputRef} onClick={() => setFocus(focus => !focus)} readOnly />
            <i className={`far fa-calendar-alt ${styles.cal}`}></i>
            {focus && <div className={styles.date}>
                <DateRange onChange={onDateChange} defaultValue={rangeDate} />
            </div>}
        </div>
    )
}

const DuplicateModal: FC<any> = ({ children, setActive }) => {
    return createPortal(<div onClick={() => setActive(false)} className={styles.duplicate_modal}>
        <div onClick={(e) => e.stopPropagation()} className={styles.container}>
            {children}
        </div>
    </div>, document.getElementById('overlay'))
}
const Upload: FC<any> = ({ onSuccess }) => {
    const [text, setText] = useState('')
    const selectRef = useRef<HTMLSelectElement>()
    const fileRef = useRef<HTMLInputElement>()
    const passwordRef = useRef<HTMLInputElement>()
    const intervalRef = useRef<NodeJS.Timer>()
    const [du, setDu] = useState(false)
    const [duplicateDate, setDuplicateDate] = useState([])
    const [ModalWrapper, modal, setModal] = useModal()
    const { loading: [loading, setLoading], notify } = useContext(AppContext)

    const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files.length) return
        setText(e.currentTarget.files[0].name)
        // notify.current.push('ad')
    }
    const onUpload = async (e: MouseEvent<HTMLButtonElement>) => {
        const file = fileRef.current.files[0]
        if (!file) return notify.current.push('กรุณาเลือกไฟล์ก่อนอัพโหลด', 'error')
        setLoading(true)
        const presignRes = await axios.get(`/api/getPresignedUrl?team=${selectRef.current.value}&key=${passwordRef.current.value}&ext=${fileRef.current.files[0].name.split('.').slice(-1)[0]}`)
        if (!presignRes.data.url) {
            setLoading(false)
            return notify.current.push('รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง', 'error')
        }
        const docId = presignRes.data.docId

        const config = {
            headers: {
                "x-amz-acl": "public-read",
                "Content-Type": file.type
            },
            // onUploadProgress: (event: any) => {
            //     console.log(event);
            // }
        }
        const uploadRes = await axios.put(presignRes.data.url, file, config)
        // intervalRef.current = setInterval(async () => {
        while (true) {
            const status = await axios.get(`/api/doc/${docId}?key=${passwordRef.current.value}`)
            if (status.data.status === 'SUCCESS') {
                // clearInterval(intervalRef.current)
                setLoading(false)
                notify.current.push('อัพโหลดสำเร็จ!')
                fileRef.current.value = ''
                onSuccess(passwordRef.current.value, selectRef.current.value)
                break
            }
            if (status.data.status === 'ERROR') {
                setLoading(false)
                if (status.data.duplicated) {
                    notify.current.push('พบข้อมูลซ้ำ กรุณาลองอีกครั้ง', 'error')
                    // setModal({ name: 'duplicate' })
                    setDu(true)
                    setDuplicateDate(status.data.duplicated)
                    break
                }
                notify.current.push('ข้อมูลไม่ถูกต้อง กรุณาลองอีกครั้ง', 'error')
                break
            }
        }

        // console.log()
        // }, 500)
        // notify.current.open('ad')

        // return


        // console.log(uploadRes);
    }
    useEffect(() => {
        const team = localStorage.getItem('TEAM')
        if (!team) return
        selectRef.current.value = team
    }, [])
    return (
        <div className={styles.import}>
            {du && <DuplicateModal setActive={setDu}>

                <span style={{ marginBottom: '10px' }}>ตรวจพบไฟล์ซ้ำในระบบ</span>
                <div className={styles.table_container}>
                    <div className={styles.item}>
                        <div className={styles.fixed} >#</div>
                        <div style={{ minWidth: '100px' }} className={styles.fixed} >
                            <span>ชื่อ</span>
                        </div>
                        <div className={styles.fixed} >
                            <span>นามสกุล</span>
                        </div>
                        <div className={styles.flexible} >
                            <span> ชื่อกิจกรรม</span>
                        </div>
                        <div style={{ minWidth: '190px', justifyContent: 'flex-end' }} className={styles.fixed} >
                            <span> วันที่ออกใบประกาศ</span>
                        </div>

                    </div>
                    {duplicateDate.map((item, index) => (
                        <div key={index} style={{ animation: 'none', opacity: 1, transform: 'none' }} className={styles.item}>
                            <div className={styles.fixed} >{index + 1}</div>
                            <div style={{ minWidth: '100px' }} className={styles.fixed} >
                                <span>{item.firstName}</span>
                            </div>
                            <div className={styles.fixed} >
                                <span>{item.lastName}</span>
                            </div>
                            <div className={styles.flexible} >
                                <span>{`${item.text1}${item.text2}`}</span>
                            </div>
                            <div style={{ minWidth: '190px', justifyContent: 'flex-end' }} className={styles.fixed} >
                                <span > {dayjs.unix(item.timestamp).locale('th').format('DD MMMM YYYY')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </DuplicateModal>}
            <div style={{ alignItems: 'center' }}>
                <span style={{ fontSize: '1.2em' }}>นำเข้ารายชื่อ</span>
                {duplicateDate.length > 0 && <span onClick={() => setDu(true)} style={{ fontSize: '0.8em', marginTop: '2px', marginLeft: '5px', color: 'red', cursor: 'pointer' }}>(ไฟล์ซ้ำในระบบ)</span>}

            </div>
            <div className={styles.template}>
                <i className="fas fa-download"></i>
                <Link href='https://certificate-generator.s3.ap-southeast-1.amazonaws.com/template.xlsx'>
                    <a>ดาวน์โหลด Template (*xlsx) สำหรับส่งรายชื่อเข้าสู่ระบบ</a>
                </Link>
            </div>
            <div className={styles.upload}>
                <div style={{ alignItems: 'center' }}>
                    <label htmlFor='upload'>เลือกไฟล์</label>
                    <input ref={fileRef} id='upload' onChange={onChange} type='file' accept='.xlsx,.xls' />
                    <span>{text ? text : 'ไม่ได้เลือกไฟล์'}</span>
                </div>
                <label>*.xls,*.xlsx</label>
            </div>
            <div className={styles.confirm} style={{ flexShrink: 0, display: 'flex' }}>
                <select ref={selectRef} name='team' >
                    <option value='smartfactory'>Smart Factory</option>
                    <option value='3dtelepringting'>Tele-3D Printing</option>
                </select>
                <input ref={passwordRef} name='password' type='password' placeholder='Password' />
                <button onClick={onUpload}>
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
    const [limit, setLimit] = useState(0)
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
    const [checkbox, setCheckbox] = useState([])
    const [isExport, setExport] = useState(false)
    const [focus, setFocus] = useState(false)
    const [rangeDate, setRangeDate] = useState<dayjs.Dayjs[]>([])
    const selectRef = useRef<HTMLSelectElement>()
    const passwordRef = useRef<HTMLInputElement>()
    const formRef = useRef<HTMLFormElement>()
    const { swr: { data: rawData, mutate, setSize, isValidating }, contetnIntersecRef: conRef } = useSWRScroll(currentKey ? (filterHandler(filter, currentCourse, currentKey)) : null, {
        limit: 50,
        onIntersection: (ratio) => {
            if (ratio === 1) {
                console.log(ratio);
                if (!isStart) return
                setLimit(limit => limit + 50)

            }
        }
    })
    const data = useMemo(() => rawData && rawData.flatMap(item => item.data), [rawData])
    const [pageInterRef, contetnIntersecRef] = useIntersection(async (entries: IntersectionObserverEntry[]) => {
        const ratio = entries[0].intersectionRatio
        if (!ratio) setIsScroll(true)
        else setIsScroll(false)
    }, [])
    console.log(rawData);

    useEffect(() => {
        if (!data) return
        if (!data.every(item => item)) {
            setError(true)
            setStart(false)
            // console.log('error');
        }
        else setError(false)
        // setLoading(true)
        // console.log(data);

    }, [data])
    useEffect(() => {
        (async () => {
            if (!isExport || !data?.length) return
            if (isValidating) return
            const res = await axios.post(`/api/export/${currentCourse}`, data)
            location.href = res.data.path
            setLoading(false)
            setExport(false)
            setLimit(50)
            // console.log(res.data);
        })()
    }, [isValidating, isExport, data])
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
    const onDateChange = (date: dayjs.Dayjs[]) => {
        if (!date.length) return
        console.log('dat3', date);
        setFilter({ ...filter, from: date[0].unix(), to: date[1].unix() })
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
        mutate()
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
        if (!data?.every(item => item)) return notify.current.push('ไม่พบข้อมูล กรุณาลองอีกครั้ง', 'error')
        setLoading(true)
        const url = filterHandler(filter, currentCourse, currentKey)
        const dataRes = await axios.get(url)
        const res = await axios.post(`/api/export/${currentCourse}`, dataRes.data.data)
        location.href = res.data.path
        setLoading(false)

        // setLoading(true)
        // setLimit(9999)
        // setSize(9999)
        // setExport(true)
    }
    const onTeamChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value
        setCurrentCourse(value)
        pageInterRef.current.scrollTop = 0
        localStorage.setItem('TEAM', value)
    }
    const onUploadSuccess = (password: string, team: string) => {
        console.log('asd');

        setModal({})
        selectRef.current.value = team
        passwordRef.current.value = password
        onQuery()
    }
    const onCheckbox = (value: boolean, code: string) => {
        if (value) setCheckbox([...checkbox, code])
        else setCheckbox(checkbox.filter(item => item !== code))
    }
    const onCheckAll = (value: boolean) => {
        if (!data) return
        if (value) setCheckbox(data.slice(0, limit).map(item => item.code))
        else setCheckbox([])
    }
    const onRemove = async (code: string) => {
        setLoading(true)
        const res = await axios.post(`/api/${currentCourse}/remove?key=${currentKey}`, { codes: [code] })
        console.log(res.data);
        await mutate()
        setLoading(false)
        notify.current.push('ลบข้อมูลสำเร็จ!')


    }
    const removeAll = async () => {
        setLoading(true)
        const res = await axios.post(`/api/${currentCourse}/remove?key=${currentKey}`, { codes: checkbox })
        console.log(res.data);
        await mutate()
        setLoading(false)
        setCheckbox([])
        notify.current.push('ลบข้อมูลสำเร็จ!')


    }
    const onCopy = (url: string) => {
        navigator.clipboard.writeText(url)
        notify.current.push('คัดลอกลิงค์สำเร็จ!')
    }
    const onFilterClear = () => {
        formRef.current.reset()
        setRangeDate([])
        setFilter({
            firstName: '',
            lastName: '',
            email: '',
            timestamp: '',
            trainingTopic: '',
            from: null,
            to: null
        })
    }
    useEffect(() => {
        console.log(checkbox);
    }, [checkbox])
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
                <div style={{ flexShrink: 0, alignItems: 'center' }}>
                    {checkbox.length > 0 && <div className={styles.tools}>
                        <div onClick={removeAll} title='ลบ' className={styles.icon}><i className="fas fa-trash"></i></div> <span> ({checkbox.length})</span>
                    </div>}

                </div>
                {/* <form id='query'> */}
                <div style={{ flexShrink: 0, display: 'flex' }}>
                    {data?.length > 0 && <span style={{ flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                        Total {data?.slice(0, limit).length}{data?.slice(0, limit).length < data?.length && '+'} data
                    </span>}
                    <button style={{ marginRight: '10px' }} onClick={onImport}>
                        <i className="fas fa-file-import"></i>
                        <span>นำเข้าไฟล์</span>
                    </button>
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
                    <form ref={formRef} onSubmit={e => e.preventDefault()}>
                        <div style={{ paddingTop: '2px' }} className={styles.fixed} ><Checkbox icon={checkbox.length === data?.slice(0, limit).length ? 'all' : 'partial'} value={checkbox.length} onChange={onCheckAll} /></div>
                        <div className={styles.fixed} >#</div>
                        <div className={styles.fixed} >
                            <span>ชื่อ</span>
                            <input onChange={e => onSearch(e, 'firstName')} />
                        </div>
                        <div className={styles.fixed} >
                            <span>นามสกุล</span>
                            <input onChange={e => onSearch(e, 'lastName')} />
                        </div>
                        <div className={styles.flexible} >
                            <span> ชื่อกิจกรรม</span>
                        </div>
                        <div style={{ minWidth: '190px', justifyContent: 'flex-end' }} className={styles.fixed} >
                            {focus && <div className={styles.focus} />}
                            <span style={{ marginLeft: '50px', textAlign: 'right' }}> วันที่ออกใบประกาศ</span>
                            <DatePicker rangeDate={rangeDate} setRangeDate={setRangeDate} onChange={value => onDateChange(value)} setFocus={setFocus} focus={focus} />
                            {/* <DatePicker onChange={(from: number, to: number) => onDateChange(from, to)} /> */}
                        </div>
                        <div className={styles.fixed} >
                            <span>Email</span>
                            <input onChange={e => onSearch(e, 'email')} />
                        </div>
                        <div style={{ flex: '0 0 110px', minWidth: '110px' }} className={styles.fixed} >
                            <span style={{ whiteSpace: 'pre-wrap' }}>{`   `}</span>
                            <button onClick={onFilterClear}>Clear Filter</button>
                        </div>
                        {/* <div className={styles.fixed} >
                    <span>  URL</span>
                    </div> */}
                    </form>
                </div>
                {!currentKey && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>กรุณาใส่รหัสผ่านเพื่อค้นหา</span>}
                {error && !isStart && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>รหัสผ่านไม่ถูกต้อง</span>}
                {!error && currentKey && isStart && !data && !isValidating && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>ไม่พบรายการ</span>}

                {data?.every(item => item) && data?.slice(0, limit).map((item, index) => (
                    <div key={index} className={styles.item}>
                        <div className={styles.fixed}><Checkbox value={checkbox.includes(item.code)} onChange={(value: boolean) => onCheckbox(value, item.code)} /></div>
                        <div className={styles.fixed}><span>{index + 1}</span></div>
                        <div className={styles.fixed}><span>{item.firstName}</span></div>
                        <div className={styles.fixed}><span>{item.lastName}</span></div>
                        <div className={styles.flexible}>
                            <span title={`${item.text1.trim()}${item.text2.trim()}`}>{`${item.text1.trim()}${item.text2.trim()}`}</span>
                        </div>
                        <div className={styles.fixed}><span>{dayjs.unix(item.timestamp).locale('th').format('DD MMMM YYYY')}</span></div>
                        <div className={styles.fixed}><span>{item.email}</span></div>
                        <div style={{ flex: '0 0 110px', minWidth: '110px' }} className={styles.fixed}>
                            <div>

                                <Link href={`https://smartfactory.hcilab.net/certificates/${item.code}`}>

                                    <a target="_blank"><div className={styles.btn_icon}><i style={{ marginRight: '10px' }} className="fas fa-external-link-alt"></i></div></a>
                                </Link>
                                <div title='คัดลอก' onClick={() => onCopy(`https://smartfactory.hcilab.net/certificates/${item.code}`)} className={styles.btn_icon}><i className="fas fa-copy"></i></div>
                            </div>
                        </div>
                        <div title='ลบ' onClick={() => onRemove(item.code)} className={styles.icon}><i className="fas fa-trash"></i></div>
                    </div>
                ))}
                {isValidating && isStart && (data?.length !== data?.slice(0, limit).length || isStart) && <span style={{ width: '100$', padding: '20px', textAlign: 'center' }}>กำลังค้นหา...</span>}
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
