export function getDayRange(epoch: number) {
  epoch = Number(epoch)
  if (String(epoch).length < 13) {
    epoch = epoch * 1000
  }
  // Create a date object from the epoch in seconds.
  // This date object correctly represents the point in time in the browser's local timezone.
  const date = new Date(epoch)

  // Create a new Date for the start of the day in the local timezone.
  // getFullYear(), getMonth(), and getDate() all return values based on the date in the local timezone.
  const startOfDayDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0
  )

  // Create a new Date for the end of the day in the local timezone.
  const endOfDayDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  )

  // Convert the start and end of day Date objects back to epoch seconds.
  const startOfDay = Math.floor(startOfDayDate.getTime())
  const endOfDay = Math.floor(endOfDayDate.getTime())

  return { startOfDay, endOfDay }
}
