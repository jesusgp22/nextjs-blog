import { format } from 'date-fns'

export default function Date({ ts }) {
  try {
    return format(ts, 'LLLL d, yyyy')
  }catch(e){
    return 'Unknown date'
  }
  
}