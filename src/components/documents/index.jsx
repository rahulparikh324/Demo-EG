import React, { useState, useRef } from 'react'

import CreateNewFolderOutlinedIcon from '@material-ui/icons/CreateNewFolderOutlined'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Modal from '@material-ui/core/Modal'

import { MinimalButton } from 'components/common/buttons'
import CreateFolder from './create-folder'
import { FileContainer, FileLoader, FolderContainer } from './utils'
import useFetchData from 'hooks/fetch-data'
import document from 'Services/documents'
import { get, isEmpty, upperCase } from 'lodash'
import { AttachmentContainer } from 'components/preventative-maintenance/common/components'
import DialogPrompt from 'components/DialogPrompt'
import usePostData from 'hooks/post-data'
import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'
import $ from 'jquery'
import { LabelVal } from 'components/common/others'
import momenttimezone from 'moment-timezone'

const style = {
  folderHeader: {
    height: '50px',
    borderTop: '1px solid #EAEAEA',
    borderBottom: '1px solid #EAEAEA',
    paddingY: '3px',
  },
}

const Documents = () => {
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false)
  const [deleteModelData, setDeleteModelData] = useState([false, null])
  const [isUploading, setIsUploading] = useState(false)
  const [isViewModelData, setViewModelData] = useState([false, null])
  const uploadRef = useRef(null)

  const menuOptions = [
    { id: 1, name: 'Download', action: d => console.log('object'), icon: <GetAppOutlinedIcon fontSize='small' /> },
    { id: 2, name: 'Delete', action: d => console.log('object'), icon: <DeleteOutlineOutlinedIcon fontSize='small' /> },
  ]

  const fileMenuOptions = [
    { id: 1, name: 'Download', action: d => window.open(d.fileUrl, '_blank'), icon: <GetAppOutlinedIcon fontSize='small' /> },
    { id: 2, name: 'Delete', action: d => setDeleteModelData([true, d]), icon: <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: 'red' }} />, color: 'red' },
  ]

  const handleDownload = (url, filename) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.blob() // Convert the response into a Blob
      })
      .then(blob => {
        // Create a temporary URL for the Blob
        const blobUrl = window.URL.createObjectURL(blob)

        // Create an anchor element and trigger the download
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a) // Append to the DOM
        a.click() // Trigger the download
        a.remove() // Clean up the DOM

        // Revoke the Blob URL to free memory
        window.URL.revokeObjectURL(blobUrl)
      })
      .catch(error => {
        console.error('Error downloading the file:', error)
      })
  }

  const { loading, data, reFetch } = useFetchData({ fetch: document.get, payload: { pageindex: 0, pagesize: 0 }, formatter: d => get(d, 'data.list', []), defaultValue: [] })
  const postSuccess = () => {
    reFetch()
    setDeleteModelData([false, null])
  }

  const { loading: deleteFileLoading, mutate: deleteFile } = usePostData({ executer: document.delete, postSuccess, message: { success: 'File deleted successfully !', error: 'Something went wrong !' } })
  const handleDeleteFile = () => deleteFile({ sitedocumentId: [deleteModelData[1].sitedocumentId] })

  const addAttachment = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    uploadAttachment(file)
    e.target.value = null
  }

  const uploadAttachment = async file => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsUploading(true)
      const res = await document.upload(formData)
      if (res.success === 1) {
        Toast.success(enums.resMessages.msg_upload_template)
        reFetch()
      } else {
        const msg = isEmpty(res.message) ? enums.errorMessages.error_msg_upload_template : res.message
        Toast.error(msg)
      }
      setIsUploading(false)
    } catch (error) {
      console.log(error)
      Toast.error(enums.errorMessages.error_msg_upload_template)
      setIsUploading(false)
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 128px)', paddingY: '20px', background: '#fff' }}>
      <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
      {true && (
        <div className='d-flex' style={{ height: '100%' }}>
          {/* <div style={{ minWidth: '300px', borderRight: '1px solid #EAEAEA' }}>
            <div style={style.folderHeader} className='d-flex justify-content-center align-items-center'>
              <MinimalButton text='New Folder' size='small' startIcon={<CreateNewFolderOutlinedIcon />} onClick={() => setCreateFolderOpen(true)} variant='contained' color='primary' baseClassName='nf-buttons' />
            </div>
            <FolderContainer title='Flder 1' hasMenu isLocation />
          </div> */}
          <div style={{ minWidth: 'calc(100% - 0px)', borderRight: '1px solid #EAEAEA', padding: '20px' }}>
            {loading ? (
              <FileLoader />
            ) : !isEmpty(data) ? (
              <>
                <div className='d-flex flex-row-reverse justify-content-between align-items-center'>
                  <MinimalButton text='Upload File' size='small' startIcon={<NoteAddOutlinedIcon />} onClick={() => uploadRef.current && uploadRef.current.click()} variant='contained' color='primary' baseClassName='nf-buttons' loading={isUploading} disabled={isUploading} loadingText='Uploading...' />
                  <div className='text-bold' style={{ fontSize: '20px' }}>
                    Files
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }} className='mt-4'>
                  {data.map(d => (
                    <div key={d.sitedocumentId}>
                      <FileContainer filename={d.fileName} hasMenu menuOptions={fileMenuOptions} data={d} viewDetails={() => setViewModelData([true, d])} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ position: 'absolute', top: '50%', left: '53%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <svg width='50' height='40' viewBox='0 0 54 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M0.333496 43.3307H53.6668V32.6641H0.333496V43.3307ZM5.66683 35.3307H11.0002V40.6641H5.66683V35.3307ZM0.333496 0.664062V11.3307H53.6668V0.664062H0.333496ZM11.0002 8.66406H5.66683V3.33073H11.0002V8.66406ZM0.333496 27.3307H53.6668V16.6641H0.333496V27.3307ZM5.66683 19.3307H11.0002V24.6641H5.66683V19.3307Z' fill='#474747' />
                </svg>
                <div className='my-4 text-bold' style={{ color: 'rgba(0, 0, 0, 0.44)' }}>
                  There are no Files, Please upload new file.
                </div>
                <MinimalButton text='Upload File' size='small' startIcon={<NoteAddOutlinedIcon />} onClick={() => uploadRef.current && uploadRef.current.click()} variant='contained' color='primary' baseClassName='nf-buttons' loading={isUploading} disabled={isUploading} loadingText='Uploading...' />
              </div>
            )}
          </div>
        </div>
      )}

      {false && (
        <div style={{ position: 'absolute', top: '50%', left: '53%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <svg width='50' height='40' viewBox='0 0 54 44' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M0.333496 43.3307H53.6668V32.6641H0.333496V43.3307ZM5.66683 35.3307H11.0002V40.6641H5.66683V35.3307ZM0.333496 0.664062V11.3307H53.6668V0.664062H0.333496ZM11.0002 8.66406H5.66683V3.33073H11.0002V8.66406ZM0.333496 27.3307H53.6668V16.6641H0.333496V27.3307ZM5.66683 19.3307H11.0002V24.6641H5.66683V19.3307Z' fill='#474747' />
          </svg>
          <div className='my-4 text-bold' style={{ color: 'rgba(0, 0, 0, 0.44)' }}>
            There are no Folders, Please create new folder to upload file.
          </div>
          <MinimalButton text='New Folder' size='small' startIcon={<CreateNewFolderOutlinedIcon />} onClick={() => setCreateFolderOpen(true)} variant='contained' color='primary' baseClassName='nf-buttons' />
        </div>
      )}
      {isCreateFolderOpen && <CreateFolder open={isCreateFolderOpen} onClose={() => setCreateFolderOpen(false)} />}
      <DialogPrompt title='Delete File' text='Are you sure you want to delete this File?' open={deleteModelData[0]} ctaText='Delete' actionLoader={deleteFileLoading} action={handleDeleteFile} handleClose={() => setDeleteModelData([false, null])} />
      <Modal open={isViewModelData[0]} onClose={() => setViewModelData([false, null])} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
        <div style={modalStyle} className='add-task-modal'>
          <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>View Details</div>
            <IconButton onClick={() => setViewModelData([false, null])} size='small'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </div>
          <div style={{ padding: '10px 20px' }}>
            <LabelVal label='Type' value={upperCase(isViewModelData[1]?.fileName?.split('.').at(-1))} inline lableMinWidth={100} />
            <LabelVal label='Created' value={momenttimezone.utc(isViewModelData[1]?.createdAt).format('MMM DD,YYYY')} inline lableMinWidth={100} />
            <LabelVal label='Uploaded By' value={get(isViewModelData[1], 'createdBy', 'N/A')} inline lableMinWidth={100} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Documents

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '20%',
}
