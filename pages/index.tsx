import React, { ChangeEvent } from 'react'
import styles from './index.module.sass'
import Link from 'next/link'
import axios from 'axios'
const index = () => {
    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files.length) return
        const res = await axios.get('/api/getPresignedUrl?team=smartfactory')
        const url = res.data.url
        console.log(e.target.files[0]);
        
        // e.target.value =''
        const config = {
            headers: {
                "x-amz-acl": "public-read",
                "Content-Type": e.target.files[0].type
            },
            onUploadProgress: (event:any) => {
                console.log(event);
                
                // console.log(event.loaded, event.total)

            }
        }
        const resx = await axios.put(url, e.target.files[0], config)
        console.log(resx);

    }
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <span>ข้อมูล Cerificate</span>
            </div>
            {/* <button onClick={onUpload}>dd</button> */}
            <input onChange={onUpload} type='file' />
            <div className={styles.table_container}>
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

                {[...Array(20)].map((item, index) => (
                    <div className={styles.item}>
                        <div className={styles.fixed}>{index + 1 * 10}</div>
                        <div className={styles.fixed}>Chindanai</div>
                        <div className={styles.fixed}>Mala-eiam</div>
                        <div className={styles.fixed}>Iot Devlelopment</div>
                        <div className={styles.fixed}>48 Dec 2048</div>
                        <div className={styles.fixed}>chindanai.mal@gmail.com</div>
                        <div className={styles.flexible}>
                            <Link href={'https://smartfactory.hcilab.net/certificates/sAldkwosdqqwdqwd'}>
                                <a>https://smartfactory.hcilab.net/certificates/sAldkwosdqqwdqwd</a>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default index
