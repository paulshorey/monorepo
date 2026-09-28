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
export function useChartEventPatcher(
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

    const mouseEvents = [
      'mousemove',
      'mouseenter',
      'mouseleave',
      'mousedown',
      'mouseup',
      'click',
      'dblclick',
    ]

    const mouseEventHandler = (e: MouseEvent) => {
      if ((e as any)._patched) return

      e.stopPropagation()

      const rect = container.getBoundingClientRect()
      const scale = window.scaleFactor || 1

      // Calculate corrected coordinates relative to the container
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
      e.target?.dispatchEvent(newEvent)
    }

    mouseEvents.forEach((eventName) => {
      container.addEventListener(eventName, mouseEventHandler as any, {
        capture: true,
      })
    })

    // Touch event patching for mobile crosshair (single-finger touch)
    const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel']

    const touchEventHandler = (e: TouchEvent) => {
      if ((e as any)._patched) return
      // Only patch single-finger touch (for crosshair), not multi-touch (pinch zoom)
      if (e.touches.length > 1) return

      e.stopPropagation()

      const rect = container.getBoundingClientRect()
      const scale = window.scaleFactor || 1

      // Create new Touch objects with scaled coordinates
      const scaledTouches: Touch[] = []
      const scaledTargetTouches: Touch[] = []
      const scaledChangedTouches: Touch[] = []

      const scaleTouch = (touch: Touch): Touch => {
        const relativeX = touch.clientX - rect.left
        const relativeY = touch.clientY - rect.top
        const newClientX = rect.left + relativeX * scale
        const newClientY = rect.top + relativeY * scale

        return new Touch({
          identifier: touch.identifier,
          target: touch.target,
          clientX: newClientX,
          clientY: newClientY,
          screenX: touch.screenX,
          screenY: touch.screenY,
          pageX: touch.pageX,
          pageY: touch.pageY,
          radiusX: touch.radiusX,
          radiusY: touch.radiusY,
          rotationAngle: touch.rotationAngle,
          force: touch.force,
        })
      }

      for (let i = 0; i < e.touches.length; i++) {
        scaledTouches.push(scaleTouch(e.touches[i]!))
      }
      for (let i = 0; i < e.targetTouches.length; i++) {
        scaledTargetTouches.push(scaleTouch(e.targetTouches[i]!))
      }
      for (let i = 0; i < e.changedTouches.length; i++) {
        scaledChangedTouches.push(scaleTouch(e.changedTouches[i]!))
      }

      const newEvent = new TouchEvent(e.type, {
        bubbles: true,
        cancelable: true,
        view: window,
        touches: scaledTouches,
        targetTouches: scaledTargetTouches,
        changedTouches: scaledChangedTouches,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
      })

      Object.defineProperty(newEvent, '_patched', { value: true })
      e.target?.dispatchEvent(newEvent)
    }

    touchEvents.forEach((eventName) => {
      container.addEventListener(eventName, touchEventHandler as any, {
        capture: true,
      })
    })

    return () => {
      container.removeEventListener('wheel', handleUserInteraction)
      container.removeEventListener('touchmove', handleUserInteraction)
      mouseEvents.forEach((eventName) => {
        container.removeEventListener(eventName, mouseEventHandler as any, {
          capture: true,
        })
      })
      touchEvents.forEach((eventName) => {
        container.removeEventListener(eventName, touchEventHandler as any, {
          capture: true,
        })
      })
    }
  }, [containerRef])
}
