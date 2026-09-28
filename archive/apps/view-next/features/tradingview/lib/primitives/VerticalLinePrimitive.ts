/**
 * VerticalLinePrimitive - A custom primitive for drawing vertical lines on lightweight-charts
 *
 * Based on the official TradingView lightweight-charts plugin example:
 * https://github.com/tradingview/lightweight-charts/tree/master/plugin-examples/src/plugins/vertical-line
 *
 * This implementation draws a vertical line at a specific timestamp to mark
 * events of interest (page load, news, earnings, etc.)
 */

import {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  Time,
  Coordinate,
  SeriesType,
  SeriesAttachedParameter,
} from 'lightweight-charts'

// Type for the canvas rendering target - matches the interface from fancy-canvas
// which is used internally by lightweight-charts
interface CanvasRenderingTarget2D {
  useMediaCoordinateSpace: (
    callback: (scope: {
      context: CanvasRenderingContext2D
      mediaSize: { width: number; height: number }
    }) => void
  ) => void
  useBitmapCoordinateSpace: (
    callback: (scope: {
      context: CanvasRenderingContext2D
      bitmapSize: { width: number; height: number }
      horizontalPixelRatio: number
      verticalPixelRatio: number
    }) => void
  ) => void
}

export interface VerticalLineOptions {
  color: string
  width: number
  labelText: string
  labelBackgroundColor: string
  labelTextColor: string
  showLabel: boolean
  lineStyle: 'solid' | 'dashed' | 'dotted'
}

const defaultOptions: VerticalLineOptions = {
  color: '#2196F3',
  width: 2,
  labelText: '',
  labelBackgroundColor: '#2196F3',
  labelTextColor: 'white',
  showLabel: true,
  lineStyle: 'dotted',
}

/**
 * Renderer - handles the actual canvas drawing
 */
class VerticalLinePaneRenderer implements IPrimitivePaneRenderer {
  private _x: Coordinate | null
  private _options: VerticalLineOptions

  constructor(x: Coordinate | null, options: VerticalLineOptions) {
    this._x = x
    this._options = options
  }

  draw(target: CanvasRenderingTarget2D): void {
    // Immediate return if no coordinate
    if (this._x === null) {
      return
    }

    target.useMediaCoordinateSpace((scope) => {
      const ctx = scope.context
      const mediaSize = scope.mediaSize

      const x = Math.round(this._x!)

      // Draw the vertical line
      ctx.save()

      if (this._options.lineStyle === 'dashed') {
        ctx.setLineDash([6, 4])
      } else if (this._options.lineStyle === 'dotted') {
        ctx.setLineDash([2, 2])
      } else {
        ctx.setLineDash([])
      }

      ctx.strokeStyle = this._options.color
      ctx.lineWidth = this._options.width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, mediaSize.height)
      ctx.stroke()
      ctx.restore()

      // Draw the label if enabled
      if (this._options.showLabel && this._options.labelText) {
        const padding = 4
        const labelY = 10

        ctx.save()
        ctx.font = 'bold 10px sans-serif'
        const textMetrics = ctx.measureText(this._options.labelText)
        const textWidth = textMetrics.width
        const textHeight = 12

        // Draw label background
        ctx.fillStyle = this._options.labelBackgroundColor
        ctx.beginPath()
        ctx.roundRect(
          x + 6,
          labelY,
          textWidth + padding * 2,
          textHeight + padding * 2,
          3
        )
        ctx.fill()

        // Draw label text
        ctx.fillStyle = this._options.labelTextColor
        ctx.fillText(
          this._options.labelText,
          x + 6 + padding,
          labelY + padding + textHeight - 2
        )
        ctx.restore()
      }
    })
  }
}

/**
 * PaneView - manages the renderer and updates coordinates
 */
class VerticalLinePaneView implements IPrimitivePaneView {
  private _source: VerticalLinePrimitive
  private _x: Coordinate | null = null

  constructor(source: VerticalLinePrimitive) {
    this._source = source
  }

  update(): void {
    const chart = this._source.chart
    const time = this._source.time

    if (!chart || !time) {
      this._x = null
      return
    }

    const timeScale = chart.timeScale()
    this._x = timeScale.timeToCoordinate(time)
  }

  renderer(): IPrimitivePaneRenderer {
    return new VerticalLinePaneRenderer(this._x, this._source.options)
  }
}

/**
 * VerticalLinePrimitive - Main primitive class that attaches to a series
 */
export class VerticalLinePrimitive implements ISeriesPrimitive<Time> {
  private _chart: IChartApi | null = null
  private _series: ISeriesApi<SeriesType> | null = null
  private _time: Time
  private _options: VerticalLineOptions
  private _paneViews: VerticalLinePaneView[]

  constructor(time: Time, options: Partial<VerticalLineOptions> = {}) {
    this._time = time
    this._options = { ...defaultOptions, ...options }
    this._paneViews = [new VerticalLinePaneView(this)]
  }

  // Public getters for the PaneView to access
  get chart(): IChartApi | null {
    return this._chart
  }

  get time(): Time {
    return this._time
  }

  get options(): VerticalLineOptions {
    return this._options
  }

  // Called when primitive is attached to a series
  attached(param: SeriesAttachedParameter<Time>): void {
    this._chart = param.chart
    this._series = param.series
  }

  // Called when primitive is detached
  detached(): void {
    this._chart = null
    this._series = null
  }

  // Called to update all views before rendering
  updateAllViews(): void {
    this._paneViews.forEach((pw) => pw.update())
  }

  // Returns the pane views for rendering
  paneViews(): readonly IPrimitivePaneView[] {
    return this._paneViews
  }

  // Update the time dynamically
  setTime(time: Time): void {
    this._time = time
    this.updateAllViews()
  }

  // Update options dynamically
  setOptions(options: Partial<VerticalLineOptions>): void {
    this._options = { ...this._options, ...options }
  }
}
