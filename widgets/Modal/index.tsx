import React, { useState, useRef, useCallback, SetStateAction, Dispatch, useEffect, FC } from 'react'
import ReactDOM from 'react-dom'
import styles from './Modal.module.sass'
// import { useApp } from '../../hooks'

type ModalType = {
    name?: string,
    data?: any,
    onCreate?: any
}
const Modal:FC<any> = ({ children, name, modal, setModal, closeBtn }) => {
    // const { ready: [ready] } = useApp()
    const isStart = useRef<boolean>(false)
    const [state, setState] = useState(true)
    const close = useCallback(() => {
        setState(false)
        // setModal({})
    }, [])
    useEffect(() => {
        if (modal.onCreate) modal.onCreate()
    }, [])
    const onAnimationEnd = () => {
        if (isStart.current) setModal({})
        else isStart.current = true
    }
    return (modal.name === name ? ReactDOM.createPortal(
        <div onClick={close} className={`${styles.dataslot_modal_container} ${!state ? styles.not_active : ''}`}>
            <div onClick={e => e.stopPropagation()} onAnimationEnd={onAnimationEnd} className={`${styles.dataslot_modal_content} ${!state ? styles.not_active : ''}`}>
                {closeBtn && <i onClick={close} className={`fas fa-times ${styles.close_btn}`}></i>}
                {children}
            </div>
        </div>
        , document.getElementById('overlay')) : null)
}
export const useModal = (): [any, ModalType, Dispatch<SetStateAction<ModalType>>] => {
    const [modal, setModal] = useState({ name: '' })
    const ModalWrapper = useCallback(({ children, name, closeBtn = true }) => (
        <Modal name={name} modal={modal} setModal={setModal} closeBtn={closeBtn} >
            {children}
        </Modal>
    ), [modal])
    return [ModalWrapper, modal, setModal]
}