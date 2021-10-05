import { useRouter } from "next/dist/client/router"
import { useEffect, useRef } from "react"
import useSWRInfinite from 'swr/infinite'
import axios from 'axios'
const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))
export const useIntersection = (callback?: any, dep?: any, thresholds = range(0, 1, 0.01), rootMargin = 0) => {
    const observerRef = useRef<HTMLDivElement>()
    const entriesRef = useRef<HTMLDivElement>()

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (callback) callback(entries)
            },
            { root: observerRef.current, threshold: thresholds, rootMargin: `${rootMargin}px` }
        )
        observer.observe(entriesRef.current)
        return () => {
            observer.disconnect()
        }
    }, dep)
    return [observerRef, entriesRef]
}
export const useSWRScroll = (url: string, option = { limit: 20, onIntersection: null }) => {
    const router = useRouter()
    const swrData = useSWRInfinite((index, prev) => {
        if (prev && !prev.lastEvaluatedKey) return null
        if (!url) return null
        if (index === 0) return `${url}&limit=${option.limit}`
        const last: any = Object.entries(prev.lastEvaluatedKey).reduce((sum, cur: any) => ({ ...sum, [cur[0]]: encodeURIComponent(cur[1]) }), {})
        return `${url}&limit=${option.limit}&lastEvaluatedKey=${prev.lastEvaluatedKey}`
    }, (url: any) => axios.get(url).then(res => res.data))
    const [pageInterRef, contetnIntersecRef] = useIntersection(async (entries: IntersectionObserverEntry[]) => {
        const ratio = entries[0].intersectionRatio
        if(option.onIntersection) option.onIntersection(ratio)
        if (ratio === 1 && swrData.data) {
            swrData.setSize(size => size + 1)
        }
    }, [swrData.setSize, swrData.data], range(0, 1, 0.1), 10)
    return { swr: swrData, pageInterRef, contetnIntersecRef }
}