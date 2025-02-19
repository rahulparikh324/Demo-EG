import React from 'react'
import { MinimalAutoComplete } from 'components/Assets/components'

function ViewNamesGroup({ views: viewNames, view, messages, onView }) {
  const views = viewNames.filter(d => d !== 'agenda')
  const options = views.map(d => ({ label: messages[d], value: d }))
  const value = options.find(d => d.value === view)
  return <MinimalAutoComplete value={value} onChange={({ value }) => onView(value)} options={options} baseStyles={{ margin: 0 }} w={100} />
}

export default function CustomToolbar({ label, localizer: { messages }, onNavigate, onView, view, views }) {
  return (
    <div className='rbc-toolbar'>
      <span className='rbc-btn-group custom-toolbar'>
        <button type='button' className='button-prev' onClick={() => onNavigate('PREV')} aria-label={messages.previous}>
          &#60;
        </button>
        <button type='button' className='button-next' onClick={() => onNavigate('NEXT')} aria-label={messages.next}>
          &#62;
        </button>
        <button type='button' className='button-today' onClick={() => onNavigate('TODAY')} aria-label={messages.today}>
          TODAY
        </button>
      </span>
      <span className='rbc-toolbar-label'>{label}</span>
      <span className='rbc-btn-group'>
        <ViewNamesGroup view={view} views={views} messages={messages} onView={onView} />
      </span>
    </div>
  )
}
