import { useEffect, useRef } from "react"
const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))
export const useIntersection = (callback?: any, dep?: [], thresholds = range(0, 1, 0.01), rootMargin = 0) => {
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