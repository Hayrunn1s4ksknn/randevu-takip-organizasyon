import { useRef } from 'react'

const SWIPE_THRESHOLD_PX = 80

/**
 * Minimal horizontal swipe-to-dismiss for right-hand slide-in drawers —
 * swiping right past the threshold calls onClose. No gesture library needed.
 */
export function useSwipeToClose(onClose: () => void) {
  const startX = useRef<number | null>(null)

  return {
    onTouchStart: (e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (startX.current === null) return
      const deltaX = e.changedTouches[0].clientX - startX.current
      startX.current = null
      if (deltaX > SWIPE_THRESHOLD_PX) onClose()
    },
  }
}
