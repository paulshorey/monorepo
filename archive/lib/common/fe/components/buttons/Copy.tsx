'use client'

import { CopyButton, ActionIcon, rem } from '@mantine/core'
import { IconCopy } from '@tabler/icons-react'

type Props = {
  text: string
} & any //React.ComponentProps<typeof ActionIcon>;

export function Copy({ onClick, ...props }: Props) {
  return (
    <CopyButton value={props.text} timeout={2000} data-component="CopyButton">
      {({ copied, copy }) => (
        <ActionIcon
          data-component="ActionIcon"
          tabIndex={-1}
          color={copied ? 'teal' : 'gray'}
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            copy()
            if (onClick) onClick(e)
          }}
          {...props}
        >
          {copied ? (
            <IconCopy style={{ width: rem(16) }} />
          ) : (
            <IconCopy style={{ width: rem(16) }} />
          )}
        </ActionIcon>
      )}
    </CopyButton>
  )
}
