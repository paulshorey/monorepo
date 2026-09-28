'use client'

type Props = {
  epoch: number
}

export function LocalShortTime({ epoch }: Props): [string, string] {
  epoch = Number(epoch)
  const now = new Date()
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()

  const localTime = new Date(epoch)
    .toLocaleTimeString(undefined, { hourCycle: 'h24' })
    .split(':')
    .slice(0, 2)
    .join(':')

  let localDate: string
  if (epoch > midnight) {
    localDate = 'Today'
  } else {
    localDate = new Date(epoch).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    })
    if (now.getFullYear() === new Date(epoch).getFullYear()) {
      localDate = localDate.substring(0, localDate.lastIndexOf(','))
    }
  }

  return [localTime, localDate]
}
