import React from 'react'
import { useRouteMatch } from 'react-router-dom'

import IconButton from '@material-ui/core/IconButton'
import GetAppIcon from '@material-ui/icons/GetApp'
import Tooltip from '@material-ui/core/Tooltip'

function PDFViewer() {
  const match = useRouteMatch()
  const isIR = match.path === '/ir-scan-pdf'
  const url = isIR ? localStorage.getItem('ir-pdf-url') : localStorage.getItem('pdfURL')
  const name = localStorage.getItem('pdfName')
  document.title = name

  const download = () => {
    const x = document.createElement('A')
    x.setAttribute('href', url)
    x.setAttribute('download', `${name}.pdf`)
    document.body.appendChild(x)
    x.click()
  }
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className='d-flex justify-content-center' style={{ height: `100vh`, position: 'relative' }}>
        <Tooltip title='Download' placement='top'>
          <IconButton size='small' onClick={download} style={{ position: 'absolute', right: '99px', top: '14px', background: '#323639' }}>
            <GetAppIcon style={{ color: '#f1f1f1' }} />
          </IconButton>
        </Tooltip>
        <iframe src={url} frameBorder='0' itemType='application/pdf' width='100%' height='100%'></iframe>
      </div>
    </div>
  )
}

export default PDFViewer
