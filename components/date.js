import { format } from 'date-fns'

export default function Date({ ts }) {
  return format(ts, 'LLLL d, yyyy')
}