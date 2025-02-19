import { useRef, useState, useEffect } from 'react'

function useContainerWidth() {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const handleResize = entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width)
      }
    }

    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  return [containerRef, width]
}
export default useContainerWidth
