import { createContext } from 'react'
type ContextProps = {
    loading: any,
    notify: any
}
export default createContext<Partial<ContextProps>>({})