import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import styles from './index.module.sass'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)
interface CalendarProps {
    position: string
    date: dayjs.Dayjs
    onArrow: () => void
    current: dayjs.Dayjs[]
    onSelect: (date: dayjs.Dayjs) => void
    tempDate: dayjs.Dayjs
    setTempDate: Dispatch<SetStateAction<dayjs.Dayjs>>

}
const Calendar: FC<CalendarProps> = ({ position, date, onArrow, onSelect, current, tempDate, setTempDate }) => {
    const datePadding = useMemo(() => dayjs(date).date(1).day(), [date])
    const dayInMonth = useMemo(() => dayjs(date).daysInMonth(), [date])
    const isCurrentDay = useCallback((index: number) => dayjs().isSame(date.date(index + 1), 'day'), [date])
    const isStart = useCallback((index: number) => dayjs(current[0]).isSame(date.date(index + 1), 'day') && !dayjs(current[1]).isSame(dayjs(current[0])), [current, date])
    const isEnd = useCallback((index: number) => dayjs(current[1]).isSame(date.date(index + 1), 'day') && !dayjs(current[1]).isSame(dayjs(current[0])), [current, date])
    const isStartOrEnd = useCallback((index: number) => {
        if (!current.length) return
        return dayjs(current[0]).isSame(date.date(index + 1), 'day') || dayjs(current[1]).isSame(date.date(index + 1), 'day') || dayjs(tempDate).isSame(date.date(index + 1), 'day')
    }, [current, date, tempDate])

    const isBetween = useCallback((index: number) => {
        if (tempDate) return date.date(index + 1).isBetween(dayjs(current[0]), tempDate)
        else return date.date(index + 1).isBetween(dayjs(current[0]), dayjs(current[1]))
    }, [current, date, tempDate])

    // useEffect(() => {
    //     console.log(tempDate);

    // }, [tempDate])
    return (
        <div className={styles.calendar}>
            <div className={styles.month}>
                {position === 'right' && <i onClick={onArrow} className="fas fa-chevron-left"></i>}
                <span >{date.locale('th').add(543, 'year').format('MMMM YYYY')}</span>
                {position === 'left' && <i onClick={onArrow} className="fas fa-chevron-right"></i>}
            </div>
            <div className={styles.days}>
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className={styles.numbers}>
                {[...Array(datePadding)].map((_, index) => <div key={index} className={`${styles.number} ${styles.padding}`} />)}
                {/* <span>{dayjs(date).subtract(1, 'month').daysInMonth() - (datePadding - index - 1)}</span> */}
                {[...Array(dayInMonth)].map((_, index) => (
                    <div
                        onClick={() => onSelect(dayjs(date).date(index + 1))} key={index}
                        onMouseOver={() => !current.every(item => item) && setTempDate(date.date(index + 1))}
                        className={
                            `${styles.number} ${isCurrentDay(index) ? styles.isDay : ''} ` +
                            `${isStartOrEnd(index) ? current.every(item => item) ? styles.active : styles.active_pre : ''} ` +
                            `${dayjs(tempDate).isSame(date.date(index + 1), 'day') ? (date.date(index + 1).isAfter(current[0]) ? styles.end : styles.start) : ''} ` +
                            `${isBetween(index) ? styles.fade : ''}` +
                            `${isEnd(index) ? styles.end : ''}` +
                            `${isStart(index) ? date.date(index + 1).isAfter(tempDate) ? styles.end : styles.start : ''}`
                        }>
                        <span>{index + 1}</span></div>
                ))}
                {/* {[...Array(42 - dayInMonth - datePadding)].map((_, index) => <div key={index} className={`${styles.number} ${styles.padding}`} ><span>{index + 1}</span></div>)} */}
            </div>
        </div>
    )
}
const DateRange = ({ onChange, defaultValue = [] }) => {
    const [rageDate, setRageDate] = useState<dayjs.Dayjs[]>([])
    const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(defaultValue[0] || dayjs())
    const [currentRageDate, setCurrentRangeDate] = useState<dayjs.Dayjs[]>(defaultValue)
    const [tempDate, setTempDate] = useState<dayjs.Dayjs>(null)

    const setDate = (value: number) => {
        const num = Math.abs(value)
        setCurrentMonth(value > 0 ? currentMonth.add(num, 'month') : currentMonth.subtract(num, 'month'))
    }
    const onDateSelect = (date: dayjs.Dayjs) => {
        console.log(currentRageDate.length);
        if (currentRageDate.every(item => item)) setCurrentRangeDate([date, null])
        else {
            setCurrentRangeDate([currentRageDate[0], date].sort((a, b) => a?.valueOf() - b?.valueOf()))
            setTempDate(null)
        }
    }
    useEffect(() => {
        if (currentRageDate.every(item => item)) {
            setRageDate(currentRageDate)
            if (onChange) onChange(currentRageDate)
        }
    }, [currentRageDate])
    return (
        <div className={styles.container}>
            <div className={styles.date_picker}>
                <Calendar tempDate={tempDate} setTempDate={setTempDate} onSelect={onDateSelect} current={currentRageDate} date={currentMonth} onArrow={() => setDate(-1)} position='right' />
                <Calendar tempDate={tempDate} setTempDate={setTempDate} onSelect={onDateSelect} current={currentRageDate} date={currentMonth.add(1, 'month')} onArrow={() => setDate(1)} position='left' />
            </div>
            {/* <span>{rageDate[0]?.add(543, 'year').format('DD-MM-YYYY')} - {rageDate[1]?.add(543, 'year').format('DD-MM-YYYY')}</span> */}

        </div>
    )
}

export default DateRange
