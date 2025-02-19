import React, { useRef, useState } from 'react'
import { isEmpty, upperCase } from 'lodash'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import NoSimOutlinedIcon from '@material-ui/icons/NoSimOutlined'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import { ActionButton, MinimalButton } from 'components/common/buttons'
import { Toast } from 'Snackbar/useToast'
import { fileExtensions } from 'components/preventative-maintenance/common/utils'
import DialogPrompt from 'components/DialogPrompt'
import CircularProgress from '@material-ui/core/CircularProgress'
import AddIcon from '@material-ui/icons/Add'
import useFetchData from 'hooks/fetch-data'
import asset from 'Services/assets'
import { snakifyKeys } from 'helpers/formatters'
import getUserRole from 'helpers/getUserRole'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import enums from 'Constants/enums'

const Attachments = ({ assetId }) => {
  const [isDeleteAttachmentOpen, setIsDeleteAttachmentOpen] = useState(false)
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false)
  const [anchorObj, setAnchorObj] = useState([])
  const uploadRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const payload = snakifyKeys({ assetId, pagesize: 0, pageindex: 0 })
  const { loading, data: attachmentsList, reFetch } = useFetchData({ fetch: asset.attachments.get, payload, formatter: d => d.data.list })
  //
  const checkUserRole = new getUserRole()
  const deleteAttachment = async () => {
    try {
      setIsDeletingAttachment(true)
      const res = await asset.attachments.delete({ assetatachmentmappingId: anchorObj.assetatachmentmappingId })
      if (res.success === 1) {
        Toast.success(enums.resMessages.msg_delete_attachment)
        reFetch()
      } else {
        let errorMsg = isEmpty(res.message) ? enums.errorMessages.error_msg_delete_attachment : res.message
        Toast.error(errorMsg)
      }
      setIsDeletingAttachment(false)
      setIsDeleteAttachmentOpen(false)
    } catch (e) {
      console.log(e)
      setIsDeletingAttachment(false)
      Toast.error(enums.errorMessages.error_msg_delete_attachment)
    }
  }

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
    formData.append('asset_id', assetId)
    formData.append('site_id', getApplicationStorageItem('siteId'))
    try {
      setIsUploading(true)
      const res = await asset.attachments.upload(formData)
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
  // components
  const AttachmentContainer = ({ data }) => {
    const extension = data.fileName.split('.').slice(-1).pop()
    let ext = ''
    Object.keys(fileExtensions).forEach(d => {
      if (fileExtensions[d].includes(extension)) ext = d
    })
    const icon = isEmpty(ext) ? 'other' : ext

    const download = () => window.open(data.fileUrl, '_blank')

    const handleDelete = () => {
      setAnchorObj(data)
      setIsDeleteAttachmentOpen(true)
    }

    return (
      <div className='mt-2 d-flex align-items-center w-100 p-2' style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
        <div className='d-flex align-items-center w-100'>
          <img src={`/proassets/images/attachments-icons/${icon}.png`} alt='att-icon' width={32} height={32} />
          <div className='ml-2 text-bold'>
            <div style={{ fontSize: '14px', fontWeight: '400' }}>{isEmpty(data.userUploadedFileName) ? data.fileName : data.userUploadedFileName}</div>
            <div style={{ fontSize: '12px', fontWeight: '700' }}>{upperCase(icon)}</div>
          </div>
        </div>
        <ActionButton action={download} icon={<GetAppOutlinedIcon fontSize='small' />} tooltip='DOWNLOAD' />
        {checkUserRole.isCompanyAdmin() === false && <ActionButton action={handleDelete} icon={<DeleteOutlineOutlinedIcon fontSize='small' />} tooltip='DELETE' style={{ color: '#FF0000' }} />}
      </div>
    )
  }
  const NoAttachments = () => (
    <div className='d-flex flex-column align-items-center' style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: '50%', fontWeight: 800 }}>
      <NoSimOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />
      <div style={{ color: '#666', marginTop: '12px' }}>No Attachments Found !</div>
    </div>
  )

  return (
    <div style={{ minHeight: '400px', padding: '16px', position: 'relative' }}>
      <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
      {loading ? (
        <CircularProgress size={24} thickness={5} style={{ position: 'absolute', top: '50%', left: '50%' }} />
      ) : (
        <>
          {checkUserRole.isCompanyAdmin() === false && <MinimalButton onClick={() => uploadRef.current && uploadRef.current.click()} text='Add Attachment' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='xs-button' loading={isUploading} disabled={isUploading} loadingText='Uploading...' />}
          {isEmpty(attachmentsList) ? <NoAttachments /> : attachmentsList.map(a => <AttachmentContainer url={a.fileUrl} filename={a.fileName} data={a} key={a.assetatachmentmappingId} />)}
        </>
      )}
      <DialogPrompt title='Delete Attachment' text='Are you sure you want to delete the attachment ?' open={isDeleteAttachmentOpen} ctaText='Delete' actionLoader={isDeletingAttachment} action={deleteAttachment} handleClose={() => setIsDeleteAttachmentOpen(false)} />
    </div>
  )
}

export default Attachments
