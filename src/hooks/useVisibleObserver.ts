import { useState } from 'react'
import useIsomorphicLayoutEffectWithTarget from 'ahooks/es/utils/useIsomorphicLayoutEffectWithTarget'

const useVisibleObserver = (
  domRef: any,
  { onVisibleChange }: { onVisibleChange: (visible: boolean) => void },
): [boolean, number] => {
  const [show, setShow] = useState(true)
  const [height, setHeight] = useState(0)

  useIsomorphicLayoutEffectWithTarget(() => {
    if (!domRef) return
    setHeight(domRef.getBoundingClientRect().height)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.target === domRef) {
          setShow(entry.isIntersecting)
          onVisibleChange(entry.isIntersecting)
        }
      })
    }, {
      threshold: 0.2,
      root: domRef.parentNode,
    })

    io.observe(domRef)

    return () => {
      io.disconnect()
    }
  }, [], domRef)

  return [show, height]
}

export default useVisibleObserver


