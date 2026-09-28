import { useEffect, RefObject, useRef } from 'react'

/**
 * Hook to patch mouse events for charts rendered at zoom: 0.5
 *
 * Since the body is scaled by 0.5 and chart width is 2x, we need to double
 * the mouse coordinates so the chart (which thinks it's 2x wide) gets the
 * correct relative position.
 *
 * Also detects user scrolling via wheel/touch events and calls the callback.
 *
 * @param containerRef - Ref to the chart container element
 * @param onUserScroll - Callback when user scrolls/pans the chart
 */
export function useEventPatcher(
  containerRef: RefObject<HTMLDivElement | null>,
  onUserScroll?: () => void
) {
  const onUserScrollRef = useRef(onUserScroll)
  onUserScrollRef.current = onUserScroll

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Detect actual user scrolling via wheel/touch events
    const handleUserInteraction = () => {
      onUserScrollRef.current?.()
    }

    // Wheel event = user scrolling horizontally on the chart
    container.addEventListener('wheel', handleUserInteraction, {
      passive: true,
    })
    // Touch events for mobile panning
    container.addEventListener('touchmove', handleUserInteraction, {
      passive: true,
    })

    const events = [
      'mousemove',
      'mouseenter',
      'mouseleave',
      'mousedown',
      'mouseup',
      'click',
      'dblclick',
    ]

    const eventHandler = (e: MouseEvent) => {
      if ((e as any)._patched) return

      e.stopPropagation()

      // Use the actual target's rect for more accurate coordinate calculation
      // This handles cases where the canvas has slight offset from container
      const target = e.target as HTMLElement
      const rect =
        target?.getBoundingClientRect() || container.getBoundingClientRect()
      const scale = window.scaleFactor || 1

      // Calculate corrected coordinates relative to the target element
      const relativeX = e.clientX - rect.left
      const relativeY = e.clientY - rect.top

      const newClientX = rect.left + relativeX * scale
      const newClientY = rect.top + relativeY * scale

      const newEvent = new MouseEvent(e.type, {
        bubbles: true,
        cancelable: true,
        view: window,
        detail: e.detail,
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: newClientX,
        clientY: newClientY,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        button: e.button,
        buttons: e.buttons,
        relatedTarget: e.relatedTarget,
      })

      Object.defineProperty(newEvent, '_patched', { value: true })
      target?.dispatchEvent(newEvent)
    }

    events.forEach((eventName) => {
      container.addEventListener(eventName, eventHandler as any, {
        capture: true,
      })
    })

    return () => {
      container.removeEventListener('wheel', handleUserInteraction)
      container.removeEventListener('touchmove', handleUserInteraction)
      events.forEach((eventName) => {
        container.removeEventListener(eventName, eventHandler as any, {
          capture: true,
        })
      })
    }
  }, [containerRef])
}
