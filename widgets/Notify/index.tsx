import React, { useState, useEffect, useContext, forwardRef, useImperativeHandle, useRef } from 'react'
import ReactDOM from 'react-dom'
import styles from './Notify.module.sass'
import AppContext from 'contexts/app'
// const timeout = ms => new Promise(res => setTimeout(res, ms))


export const Notify = forwardRef(({ }: any, ref: any) => {
    const isActive = useRef(false)
    const [ready, setReady] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>()
    const [label, setLabel] = useState('')
    const [style, setStyle] = useState('error')
    // const { ready: [ready] } = useContext(AppContext)
    const notifyRef = useRef<HTMLDivElement>()
    const [scroll, setScroll] = useState(0)
    useEffect(() => {
        setReady(true)
    }, [])
    // document.addEventListener('scroll', function (e) {
    //     setScroll(window.scrollY)
    //     document.body.style.overflow = 'hidden'
    // })
    useImperativeHandle(ref, () => ({
        push: (label: any, style = 'success') => {
            console.log(style);
            
            if (isActive.current) {
                clearTimeout(timeoutRef.current)
                notifyRef.current.style.transform = 'translateX(200%)'
                setTimeout(() => {
                    isActive.current = false
                    ref.current.push(label,style)
                }, 400);
                return
            }
            setLabel(label)
            setStyle(style)
            isActive.current = true


            notifyRef.current.style.transform = 'translateX(0)'
            timeoutRef.current = setTimeout(() => {
                if (!notifyRef.current) return
                notifyRef.current.style.transform = 'translateX(200%)'
                isActive.current = false
            }, 4000);
        }
    }))
    // useEffect(() => {
    //     const func = async () => {
    //         // console.log(styles);
    //         if (trigger) {
    //             await timeout(2000)
    //             setState('close')
    //             await timeout(500)
    //             setTrigger()
    //             setState('open')
    //         }
    //     }
    //     func()
    // }, [trigger])
    return ready ? ReactDOM.createPortal(
        <div ref={notifyRef} className={`${styles.notify} ${styles[style]}`}>
            <i className={`fas fa-${style === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
            <span>{label}</span>
        </div>
        , document.getElementById('overlay')) : null
})