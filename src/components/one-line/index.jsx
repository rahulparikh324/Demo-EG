import React, { useState, useRef, useContext } from 'react'

import usePostData from 'hooks/post-data'
import useFetchData from 'hooks/fetch-data'

import { MinimalButton } from 'components/common/buttons'
import { AppBar } from '@material-ui/core'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import ViewCompactOutlinedIcon from '@material-ui/icons/ViewCompactOutlined'

import { get, isEmpty } from 'lodash'
import getUserRole from 'helpers/getUserRole'

import asset from 'Services/assets'

import Cluster from 'components/Assets/Cluster'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import enums from 'Constants/enums'
import FlowComponent from './flow-component'
import { MainContext } from 'components/Main/provider'

const OneLine = () => {
  const checkUserRole = new getUserRole()

  const { featureFlag } = useContext(MainContext)

  const [error, setError] = useState({})
  const [iframeKey, setIframeKey] = useState(0)
  const [showReloadMessage, setshowReloadMessage] = useState(false)
  const [mainTab, setMainTab] = useState(get(featureFlag, 'isReactFlowSingleLine', true) ? 'SINGLELINE' : 'TREEVIEW')
  const uploadQuoteRef = useRef(null)

  const isValidUrl = async url => {
    return fetch(url, { method: 'HEAD' })
      .then(response => {
        if (response.status === 200) return true
        else return false
      })
      .catch(() => false)
  }
  const formatter = async d => {
    const url = d.data.fileUrl
    const isValid = await isValidUrl(url)
    console.log(isValid, url)
    return !isEmpty(url) ? (isValid ? `${url}#toolbar=0&navpanes=0&name=${Date.now()}` : 'INVALID') : null
  }
  const postSuccess = () => {
    reFetch()
    setIframeKey(p => p + 1)
    setshowReloadMessage(true)
  }
  const { loading: fethcPdfLoading, data: pdfURL, reFetch } = useFetchData({ fetch: asset.attachments.GetUploadedOneLinePdfData, payload: getApplicationStorageItem('siteId'), formatter: d => formatter(d) })
  const { loading: isUploading, mutate: uploadedPdf } = usePostData({ executer: asset.attachments.UploadClusterOneLinePdf, postSuccess, message: { success: 'PDF Uploaded successfully!', error: 'Something went wrong' } })
  const handleUploadedPdf = async file => uploadedPdf(file)

  const handleUploadQuote = () => {
    setError('')
    uploadQuoteRef.current && uploadQuoteRef.current.click()
  }

  const addQuote = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['pdf'].includes(extension)) setError(enums.errorMessages.error_msg_file_format)
      else {
        setError('')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('site_id', getApplicationStorageItem('siteId'))
        handleUploadedPdf(formData)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }

  // const getBg = d => (d === type ? theme.palette.primary.main : 'none')
  // const getColor = d => (d === type ? '#fff' : '#000')
  // const ToggleButton = ({ label, value, tooltip, tooltipPlacement = 'top' }) => (
  //   <Tooltip title={tooltip} placement={tooltipPlacement}>
  //     <button className='minimal-input-base text-xs' style={{ color: getColor(value), background: getBg(value), padding: '7px 8px', border: 'none' }} onClick={() => setType(value)}>
  //       {label}
  //     </button>
  //   </Tooltip>
  // )

  const handleOpenNew = () => window.open(pdfURL, '_blank')
  return (
    <>
      <div style={{ height: 'calc(100vh - 128px)', background: '#fff', padding: '20px' }}>
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
              {get(featureFlag, 'isReactFlowSingleLine', true) && <Tab eventKey='SINGLELINE' title='Single Line' tabClassName='font-weight-bolder small-tab'></Tab>}
              <Tab eventKey='TREEVIEW' title='Tree View' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='PDFVIEW' title='PDF View' tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            {checkUserRole.isCompanyAdmin() && mainTab === 'PDFVIEW' && (
              <MinimalButton loading={isUploading} onClick={handleUploadQuote} loadingText='Uploading' type='submit' text='Upload PDF' fullWidth variant='contained' color='primary' baseClassName='m-2' disabled={isUploading} style={{ width: 'auto' }} startIcon={<PublishOutlinedIcon fontSize='small' />} />
            )}
            {mainTab === 'PDFVIEW' && <MinimalButton onClick={handleOpenNew} text='Open' fullWidth variant='contained' color='primary' baseClassName='m-2' disabled={isEmpty(pdfURL)} style={{ width: 'auto' }} startIcon={<ViewCompactOutlinedIcon fontSize='small' />} />}

            {!isEmpty(error) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
          </div>

          {showReloadMessage && mainTab === 'PDFVIEW' && (
            <div className='d-flex align-items-center'>
              <div className='text-bold mr-2'>Still getting old PDF ?</div>
              <MinimalButton onClick={() => window.location.reload(true)} text='RELOAD' variant='contained' color='primary' baseClassName='xs-button mr-3' />
            </div>
          )}
          {/* <div className='d-flex align-items-center m-2' style={{ padding: '2px', background: '#f6f6f6', height: '36px', marginTop: '2px', marginRight: '8px' }}>
            <ToggleButton label={<AccountTreeOutlinedIcon fontSize='small' />} value='cluster' tooltip='Graph one-line' tooltipPlacement='bottom' />
            <ToggleButton label={<InsertDriveFileOutlinedIcon fontSize='small' />} value='pdf' tooltip=' pdf one-line' tooltipPlacement='bottom' />
          </div> */}
        </div>
        <input type='file' accept='application/pdf' style={{ display: 'none' }} ref={uploadQuoteRef} onChange={addQuote} />
        {mainTab === 'PDFVIEW' && (
          <div className='d-flex justify-content-center align-items-center' style={{ height: 'calc(100% - 53px)', position: 'relative' }}>
            {fethcPdfLoading ? (
              <div className='text-bold position-absolute top-50 start-50 translate-middle'>Loading...</div>
            ) : isEmpty(pdfURL) ? (
              <div className='text-bold position-absolute top-50 start-50 translate-middle'>No data found !</div>
            ) : pdfURL === 'INVALID' ? (
              <div className='text-bold position-absolute top-50 start-50 translate-middle'>Invalid URL or URL does not seems to be accessible !</div>
            ) : (
              <iframe name={Date.now()} key={iframeKey} src={pdfURL} style={{ background: '#fff', padding: `0 !important`, margin: 0 }} scrolling='no' title='digital-one-line' frameBorder='0' itemType='application/pdf' width='100%' height='100%' />
            )}
          </div>
        )}
        {mainTab === 'TREEVIEW' && <Cluster />}
        {mainTab === 'SINGLELINE' && <FlowComponent />}
      </div>
    </>
  )
}

export default OneLine
