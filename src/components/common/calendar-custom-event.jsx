import { getStatus } from 'components/WorkOrders/onboarding/utils'
import { get, isEmpty, isNull } from 'lodash'
import React from 'react'

const CustomEvent = ({ event }) => {
  // Determine the background color based on event.wotype
  const getBackgroundColor = status => {
    const { color } = getStatus(status)
    return color
  }

  const backgroundColor = getBackgroundColor(get(event, 'status', 0))
  return (
    <div className='custom-event d-flex align-items-center justify-content-between' style={{ '--child-bg-color': backgroundColor, backgroundColor: `${backgroundColor}51` }}>
      {get(event, 'progress', 0) !== 0 && <div className='event-progress-bg' style={{ backgroundColor: 'var(--child-bg-color)', width: `${event.progress}%` }}></div>}
      <div className='d-flex align-items-center' style={{ zIndex: 3, margin: '4px' }}>
        {!isNaN(event.progress) && <div className='event-progress'>{event.progress}%</div>}
        <div className='ml-1'>
          {event.view === 'week' ? (
            <>
              {event.title.slice(0, 20)}
              {event.title.length > 20 && <span>...</span>}
            </>
          ) : (
            event.title
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomEvent
