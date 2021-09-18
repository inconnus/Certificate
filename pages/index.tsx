import React from 'react'
import styles from './index.module.sass'
const index = () => {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <span>ข้อมูล Cerificate</span>
            </div>
            <div className={styles.table_container}>
                <div className={styles.item}>
                    <div className={styles.fixed} >#</div>
                    <div className={styles.fixed} >ชื่อ</div>
                    <div className={styles.fixed} >นามสกุล</div>
                    <div className={styles.fixed} >ชื่อกิจกรรม</div>
                    <div className={styles.fixed} >วันที่ออกใบประกาศ</div>
                    <div className={styles.fixed} >Email</div>
                    <div className={styles.fixed} >URL</div>
                </div>
                {/* {[...Array(100)].map(item => (
                <div className={styles.item}>
                    <div className={styles.fixed}>รูปโปรไฟล์</div>
                    <div className={styles.flexible}>ชื่อผู้ใช้งาน</div>
                    <div className={styles.fixed}>วันที่สมัคร</div>
                    <div className={styles.fixed}>ใช้งานล่าสุด</div>
                    <div className={styles.fixed}>สิทธิ์การใช้งาน</div>
                    <div className={styles.fixed}>สถานะ</div>
                </div>
            ))} */}
            </div>
        </div>
    )
}

export default index
