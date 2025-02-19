import moment from 'moment'
import momenttimezone from 'moment-timezone'

export const getDateTime = (date, tz = 'America/Los_Angeles') => {
  if (!date || !tz) return 'NA'
  const dt = momenttimezone.utc(date).tz(tz).format('MM-DD-YYYY LT')
  return dt
}

export const getFormatedDate = (date, withTime) => {
  if (!date) return 'NA'
  if (withTime) return momenttimezone.utc(date).format('MM-DD-YYYY LT')
  return `${date.slice(5, 7)}-${date.slice(8, 10)}-${date.slice(0, 4)}`
}

export const dateDifference = date => {
  if (!date) return 'NA'
  const date2 = new Date()
  const date1 = new Date(date)
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const MS_PER_YEAR = MS_PER_DAY * 365.25
  const MS_PER_MONTH = MS_PER_YEAR / 12
  const MS_PER_WEEK = MS_PER_MONTH / 4

  const diffInMs = Math.abs(date1 - date2)
  const years = Math.floor(diffInMs / MS_PER_YEAR)
  const months = Math.floor((diffInMs % MS_PER_YEAR) / MS_PER_MONTH)
  const weeks = Math.floor((diffInMs % MS_PER_MONTH) / MS_PER_WEEK)
  const days = Math.floor((diffInMs % MS_PER_WEEK) / MS_PER_DAY)

  let message = ''
  if (years) message += `${years} Year${years > 1 ? 's' : ''}`
  if (months) message += ` ${months} Month${months > 1 ? 's' : ''}`
  if (weeks && !years) message += ` ${weeks} Week${weeks > 1 ? 's' : ''}`
  if (days && !years && !weeks) message += ` ${days} Day${days > 1 ? 's' : ''}`

  if (!years && !months && !weeks && days && days < 7) return 'Overdue'
  return message
}

export const formattedTimeLocalToUTC = date => moment(date).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')

export const formattedDateUTCToLocal = date => moment(date, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').local().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
