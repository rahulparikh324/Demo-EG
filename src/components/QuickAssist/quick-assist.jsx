import React, { useEffect, useRef, useState } from 'react'

import HelpOutlineOutlined from '@material-ui/icons/HelpOutlineOutlined'
import NewReleasesOutlined from '@material-ui/icons/NewReleasesOutlined'
import URL from 'Constants/apiUrls'

const QuickAssist = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const handleSupportLinkBtn = () => {
    window.open(URL.supportUrl, '_blank')
  }

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [])

  const menuOptions = [
    { id: 1, type: 'button', text: 'Product Updates', onClick: null, icon: <NewReleasesOutlined size='small' />, disabled: false, className: 'beamerTrigger' },
    { id: 2, type: 'button', text: 'Help Center', onClick: handleSupportLinkBtn, icon: <HelpOutlineOutlined size='small' />, disabled: false, className: '' },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginLeft: '5px', marginRight: '15px', position: 'relative', cursor: 'pointer', backgroundColor: open && '#fff', borderRadius: '16px', padding: '4px' }} onClick={() => setOpen(true)}>
        <HelpOutlineOutlined size='medium' style={{ color: open ? '#778899' : '#fff' }} />
      </div>
      <div ref={ref} className='rd-pop-up-container' style={{ minWidth: '200px', marginTop: '10px', display: open ? 'block' : 'none' }}>
        {menuOptions.map(item => {
          return (
            <div key={item.id} style={{ borderTop: '1px solid #eee' }}>
              {!item.disabled && (
                <button
                  id='_menu-item'
                  onClick={() => {
                    setOpen(false)
                    item.onClick != null && item.onClick()
                  }}
                  style={{ padding: '10px 14px' }}
                  className={item.className}
                  data-beamer-badge
                >
                  {item.icon} <span style={{ marginLeft: '8px', fontSize: '14px' }}>{item.text}</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuickAssist
