import enums from 'Constants/enums'

import CircularProgress from '@material-ui/core/CircularProgress'

export const statusOptions = [
  { label: 'All', value: [] },
  { label: 'Open', value: [enums.QUOTES.STATUS.OPEN] },
  { label: 'Sent to Customer', value: [enums.QUOTES.STATUS.SUBMITTED] },
  { label: 'Accepted', value: [enums.QUOTES.STATUS.ACCEPTED] },
  { label: 'Rejected', value: [enums.QUOTES.STATUS.REJECTED] },
  { label: 'Deferred', value: [enums.QUOTES.STATUS.DEFERRED] },
]
export const statusChipOptions = [
  { label: 'Open', value: enums.QUOTES.STATUS.OPEN, color: '#3941F1' },
  { label: 'Sent to Customer', value: enums.QUOTES.STATUS.SUBMITTED, color: '#DE68A5' },
  { label: 'Accepted', value: enums.QUOTES.STATUS.ACCEPTED, color: '#37D482' },
  { label: 'Rejected', value: enums.QUOTES.STATUS.REJECTED, color: '#DA3B26' },
  { label: 'Deferred', value: enums.QUOTES.STATUS.DEFERRED, color: '#929292' },
]

export const quotesType = [
  { label: 'Maintenance', value: enums.woType.Maintainance },
  { label: 'Infrared Thermography', value: enums.woType.InfraredScan },
  { label: 'Audit', value: enums.woType.OnBoarding },
]

export const quoteTypesPath = {
  [enums.woType.Maintainance]: { label: 'Maintenance', path: 'quote/maintenance' },
  [enums.woType.OnBoarding]: { label: 'Audit', path: 'quote/audit' },
  [enums.woType.InfraredScan]: { label: 'Infrared Thermography', path: 'quote/infrared-thermography' },
}

export const QuotesMetric = ({ title, count, loading, icon: Icon, color, w, h }) => (
  <div className='d-flex justify-content-between align-items-center' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', width: `${w}px`, height: `${h}px` }}>
    <div className='p-2'>
      <div className='text-bold' style={{ color: '#757575', fontSize: '9px' }}>
        {title}
      </div>
      {loading ? (
        <CircularProgress size={13} thickness={5} />
      ) : (
        <div style={{ fontSize: 14 }} className='text-bold d-flex justify-content-end'>
          {count}
        </div>
      )}
    </div>
    <div className='d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${color}35` }}>
      <Icon fontSize='small' style={{ color }} />
    </div>
  </div>
)

export const TitleCount = ({ title, count, bg, color }) => (
  <div className='d-flex align-items-center'>
    {title}
    <span className='ml-2 text-bold d-flex align-items-center justify-content-center' style={{ width: '21px', height: '21px', background: bg || '#a6a6a6', color: color || '#fff', borderRadius: '16px', fontSize: '10px' }}>
      {count}
    </span>
  </div>
)
