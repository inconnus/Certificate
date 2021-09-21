import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
export const Loading = (props: any) => {
    const Loading = () => {
        const [state, setState] = useState(false)
        useEffect(() => {
            setState(true)
        }, [])
        return (
            <div className={`loading-x ${state ? 'active' : ''}`}><div className='loader-x'></div></div>
        )
    }
    return props.ready ? ReactDOM.createPortal(props.active && < Loading />, document.getElementById('overlay')) : null
}
export default Loading