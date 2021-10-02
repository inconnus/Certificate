import React, { ChangeEvent, forwardRef, useEffect, useRef, useState, useImperativeHandle, MouseEvent } from 'react'
import styles from './Checkbox.module.sass'
const Checkbox = forwardRef(({ onChange = null, value, defaultValue = false, name = null, icon='all' }: any, ref) => {
    const [state, setState] = useState(defaultValue)
    const inputRef = useRef<HTMLInputElement>()
    // const setCheck = (state) => {
    //     inputRef.current.checked = false
    // }
    useImperativeHandle(ref, () => ({
        check: (value: any) => {
            inputRef.current.checked = value
            setState(value)
        }
    }))
    const change = (e: MouseEvent<HTMLLabelElement>) => {
        inputRef.current.checked = !state
        setState(!state)
        if (onChange) onChange(!state)
    }
    useEffect(() => {
        inputRef.current.checked = defaultValue
    }, [defaultValue])
    useEffect(() => {
        setState(value)
    }, [value])
    return (
        <label onMouseDown={change} className={`${styles.checkbox} ${state ? styles.active : ''}`}>
            <input ref={inputRef} name={name} value={state} type="checkbox" />
            <i className={`fas fa-${icon==='all'?'check':'minus'}`}></i>
        </label>
    )
})

export default Checkbox
