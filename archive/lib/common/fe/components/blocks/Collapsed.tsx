'use client'

import React, { useState } from 'react'

export function Collapsed({
  children,
  title,
  openDefault = false,
  titleCopy,
  childrenCopy,
  buttonsRight,
  isClickToToggle,
  classNames,
  ...props
}: any) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(openDefault)
  let headerProps = {}
  if (isClickToToggle) {
    headerProps = {
      ref,
      style: { userSelect: 'none' },
      role: 'button',
      tabIndex: 0,
      onClick: () => setOpen((o: any) => !o),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpen((o: any) => !o)
        }
        if (e.key === 'Escape') {
          if (ref.current) {
            setOpen(false)
            ref.current.blur()
          }
        }
      },
    }
  }
  return (
    <div
      {...props}
      role="button"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false)
        }
      }}
    >
      <div
        className="w-full flex flex-row align-middle justify-between"
        {...headerProps}
      >
        <div className="flex flex-row align-middle">{title}</div>
        {buttonsRight && (
          <div className="flex flex-row align-middle">
            {buttonsRight.map((Button: any) => {
              if (Button === 'toggle') {
                return (
                  <span
                    key="toggle"
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setOpen((o: any) => !o)
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      if (e.key === 'Space' || e.key === 'Enter') {
                        setOpen((o: any) => !o)
                      }
                      if (e.key === 'Escape') {
                        setOpen(false)
                      }
                    }}
                    className="text-center"
                  >
                    {open ? '▲' : '▼'}
                  </span>
                )
              }
              return Button
            })}
          </div>
        )}
      </div>
      {open && (
        <div className={`p-2 ${classNames?.content || ''}`}>{children}</div>
      )}
    </div>
  )
}
