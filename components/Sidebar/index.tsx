import React from 'react'
import style from './Sidebar.module.sass'
import Link from 'next/link'
const SideBar = () => {
    return (
        <div className={style.sidebar}>
            <div className={style.logo}>
                <img src='/images/logo.svg' />
                <img src='/images/logo_text.svg' />
            </div>
            <ul>
                <li>
                    <Link href='/'>
                        <a>
                            <i className="far fa-file-certificate" />
                            <span>Certificate</span>
                        </a>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default SideBar
