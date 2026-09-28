import React from 'react'

export const AccordionItem = ({
  title,
  buttonsRight,
  children,
  open,
  onToggle,
  className,
  classNames,
}: {
  title: React.ReactNode
  buttonsRight: React.ReactNode[]
  children: React.ReactNode
  open: boolean
  onToggle: () => void
  className?: string
  classNames?: { content?: string }
}) => {
  return (
    <div className={className}>
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-grow mr-4 truncate min-w-[200px]">{title}</div>
        <div
          className="flex items-center space-x-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {buttonsRight}
        </div>
      </div>
      {open && <div className={classNames?.content}>{children}</div>}
    </div>
  )
}
