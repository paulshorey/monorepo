## This entire app is zoomed out to accommodate more chart data on the screen:

```
// app/global.css
body {
  transform: scale(0.5);
  transform-origin: top left;
  width: 200%;
  height: 200%;
}
```

An intended side-effect: this makes the lines much thinner. `lineWidth: 2` now looks normal, while `lineWidth: 1` looks very thin. This looks great!

An un-intended side-effect however is added complexity around all UI elements, and even the cursor position in the window!

### UI elements are shrunk 2x! This makes them too small. Some must be fixed:

```
// apps/strength/charts/SyncedChartsWrapper.tsx
        setDimensions({
          availableWidth: windowWidth * 2,
          availableHeight: windowHeight * 2,
        })
```

```
// apps/strength/charts/SyncedCharts.tsx
width={typeof window !== 'undefined' ? window.innerWidth * 2 : 1200}
```

### The cursor position is broken, only covers 0.5 of the screen width/height. Fix:

```
// apps/strength/charts/components/Chart.tsx

      // --- Fix for zoom: 0.5 ---
      // Intercept mouse events to correct coordinates for the 2x width
      // Since the body is scaled by 0.5 and chart width is 2x, we need to double the mouse coordinates
      // so the chart (which thinks it's 2x wide) gets the correct relative position.
      const container = containerRef.current
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
        // e.preventDefault() // Optional, might interfere with other things

        const rect = container.getBoundingClientRect()
        const scale = 2 // Inverse of zoom: 0.5

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

      events.forEach((eventName) => {
        container.addEventListener(eventName, eventHandler as any, {
          capture: true,
        })
      })
      // -------------------------
```
