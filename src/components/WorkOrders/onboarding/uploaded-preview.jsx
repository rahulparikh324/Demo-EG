import { useState, useEffect, useRef } from 'react'
import useFetchData from 'hooks/fetch-data'
import { Toast } from 'Snackbar/useToast'
import { get, isEmpty, orderBy } from 'lodash'

import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Done'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import { IconButton, TablePagination, useTheme } from '@material-ui/core'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import deleteBucketObject from 'Services/WorkOrder/delete-bucket-obj'

import DialogPrompt from 'components/DialogPrompt'
import { FloatingButton, MinimalButton } from 'components/common/buttons'
import { snakifyKeys } from 'helpers/formatters'

import enums from 'Constants/enums'
import URL from 'Constants/apiUrls'
import usePostData from 'hooks/post-data'
import { MinimalInput } from 'components/Assets/components'
import ImagePreview from 'components/common/image-preview'

const UploadedPreview = ({ workOrderID, manualWoNumber, imageType }) => {
  const theme = useTheme()

  const [invalidImages, setInvalidImages] = useState({})
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [imageURL, setImageURL] = useState(null)
  const [imageId, setImageId] = useState(null)
  const [irPhotoNum, setIrPhotoNum] = useState({ imgData: null, imgValue: null, imgExt: null })
  const [isPreviewOpenForIr, setPreviewOpenForIr] = useState([false, null, ''])
  const uploadRef = useRef(null)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(1)
  const [listSize, setListSize] = useState(0)

  const formatDetails = d => {
    const list = get(d, 'data.list', [])
    setListSize(get(d, 'data.listsize', 0))
    const data = []
    list.forEach(asset => {
      get(asset, 'obIrImageLabelList', []).forEach(image => {
        data.push({ assetName: asset.assetName, assetClassName: asset.assetClassName, image })
      })
    })
    const sortedData = orderBy(data, [e => !isEmpty(e.image.irImageLabel) && e.image.irImageLabel.toLowerCase()], ['asc'])
    return sortedData
  }

  const payload = { pagesize: pageSize, pageindex: pageIndex, woId: workOrderID }
  const { loading, data, reFetch } = useFetchData({ fetch: onBoardingWorkorder.getIRPhotosV2, payload: snakifyKeys(payload), formatter: d => formatDetails(d), defaultValue: [] })

  const handleEncodeURL = url => {
    if (!url) return ''
    const parts = url.split('/')
    const secondLastPart = parts[parts.length - 2]
    const encodedSecondLastPart = encodeURIComponent(secondLastPart)
    parts[parts.length - 2] = encodedSecondLastPart
    return parts.join('/')
  }

  const checkImageValidity = url => {
    const img = new Image()
    img.onload = () => setInvalidImages(prev => ({ ...prev, [url]: false }))
    img.onerror = () => setInvalidImages(prev => ({ ...prev, [url]: true }))
    img.src = url
  }

  useEffect(() => {
    if (data.length > 0) {
      data.forEach(d => {
        const irImageUrl = handleEncodeURL(d.image.irImageLabelUrl) + '?value=' + Math.random()
        const visualImageUrl = handleEncodeURL(d.image.visualImageLabelUrl) + '?value=' + Math.random()
        d.image.irImageLabelUrl = irImageUrl
        d.image.visualImageLabelUrl = visualImageUrl
        checkImageValidity(irImageUrl)
        checkImageValidity(visualImageUrl)
      })
    }
  }, [data])

  const fallbackUrl = `${process.env.PUBLIC_URL}/proassets/images/upload-pending.png`

  const removeImage = async () => {
    setDeleteOpen(false)
    if (!isEmpty(imageURL)) {
      try {
        const [baseUrl] = imageURL.split('?')
        const parts = baseUrl.split('/')
        const lastThreeParts = parts.slice(-3)
        const joinedPath = lastThreeParts.join('/')

        const res = await deleteBucketObject(snakifyKeys({ fileName: [decodeURI(joinedPath)], bucketType: enums.AWS_Bucket_Type.IR_Visual_Images }))
        if (res.success > 0) {
          setInvalidImages(prevState => {
            const newState = { ...prevState, [imageURL]: true }
            return newState
          })
        }
      } catch (error) {
        console.error('Error removing image:', error)
      }
    }
  }

  const handleUpload = () => uploadRef.current && uploadRef.current.click()

  const addPhotos = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else {
        uploadPhoto(file)
      }
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }

  const handleSuccess = res => {
    if (res.success > 0) {
      setTimeout(() => {
        reFetch()
      }, 1500)
    }
  }

  const updateLableSuccess = res => {
    if (res.success > 0) {
      setTimeout(() => {
        handleClearBtn()
        reFetch()
      }, 1000)
    }
  }

  const { uploadLoading, mutate } = usePostData({ executer: onBoardingWorkorder.uploadIrPhoto, postSuccess: handleSuccess, message: { success: 'Image uploaded !', error: 'Error uploading image, Please try again' } })

  const { loading: updateLableLoading, mutate: updateLableData } = usePostData({ executer: onBoardingWorkorder.updateImageLabel, postSuccess: updateLableSuccess, message: { success: 'Image label updated!', error: 'Error updating image label. Please try again.' } })

  const uploadPhoto = async file => {
    const formData = new FormData()
    formData.append(`file`, file, file.name)
    formData.append('manual_wo_number', manualWoNumber)
    formData.append('wo_id', workOrderID)
    mutate(formData)
  }

  const handleImgLableEditCLick = (id, data, type) => {
    let value = ''
    let ext = ''
    if (type === 'ir') {
      setIrPhotoNum(pre => {
        if (get(data, 'image.irImageLabel', '') && !isEmpty(get(data, 'image.irImageLabel', ''))) {
          const img = get(data, 'image.irImageLabel', '')
          const lastDotIndex = img.lastIndexOf('.')
          value = img.substring(0, lastDotIndex)
          ext = img.substring(lastDotIndex)
        }
        return { ...pre, imgData: data, imgValue: value, imgExt: ext }
      })
    } else {
      if (get(data, 'image.visualImageLabel', '') && !isEmpty(get(data, 'image.visualImageLabel', ''))) {
        const img = get(data, 'image.visualImageLabel', '')
        const lastDotIndex = img.lastIndexOf('.')
        value = img.substring(0, lastDotIndex)
        ext = img.substring(lastDotIndex)
      }
      setIrPhotoNum(pre => {
        return { ...pre, imgData: data, imgValue: value, imgExt: ext }
      })
    }
    setImageId(id)
  }

  const handlePhotoNumChange = (data, value) => {
    setIrPhotoNum(pre => {
      return { ...pre, imgValue: value }
    })
  }

  const handleClearBtn = () => {
    setImageId(null)
    setIrPhotoNum(pre => {
      return { ...pre, imgData: null, imgValue: null, imgExt: null }
    })
  }

  const handleOkBtn = (d, type) => {
    if (!isEmpty(irPhotoNum?.imgValue)) {
      if (type === 'ir') {
        const payload = {
          irwoimagelabelmapping_id: get(d, 'image.irwoimagelabelmappingId', ''),
          ir_image_label: irPhotoNum?.imgValue + irPhotoNum?.imgExt,
          visual_image_label: get(d, 'image.visualImageLabel', ''),
        }
        updateLableData(payload)
      } else {
        const payload = {
          irwoimagelabelmapping_id: get(d, 'image.irwoimagelabelmappingId', ''),
          visual_image_label: irPhotoNum?.imgValue + irPhotoNum?.imgExt,
          ir_image_label: get(d, 'image.irImageLabel', ''),
        }
        updateLableData(payload)
      }
    }
  }

  const handleImgPrivewBtn = (data, key) => {
    const jsonObject = { ...data }
    const jsonArray = [jsonObject]
    setPreviewOpenForIr([true, jsonArray, key])
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }

  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }

  return (
    <div style={{ height: 'calc(100vh - 170px)', padding: '12px' }}>
      <input key='input' ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhotos} />
      {imageType === enums.PHOTO_TYPE.IR_ONLY && (
        <div className='d-flex mb-3 justify-content-end'>
          <MinimalButton onClick={reFetch} text='Refresh' size='small' startIcon={<RefreshOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '5px' }} disabled={loading} />
        </div>
      )}
      {loading ? (
        <div style={{ height: '100%' }} className='d-flex flex-column justify-content-center align-items-center text-bold'>
          <CircularProgress size={30} thickness={5} />
        </div>
      ) : isEmpty(data) ? (
        <div style={{ height: '100%', textAlign: 'center' }} className='d-flex flex-column justify-content-center align-items-center text-bold'>
          <ImageSearchOutlinedIcon style={{ fontSize: '64px', color: '#12121250' }} />
          No photos were found uploaded <br />
          Please add photos and try reloading again!
        </div>
      ) : (
        <div style={{ height: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '12px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', border: '1px solid #dee2e6' }}>
            <strong className='d-flex text-sm'>ASSET NAME</strong>
            <strong className='d-flex text-sm'>ASSET CLASS</strong>
            <strong className='d-flex text-sm'>IR PHOTO</strong>
            <strong className='d-flex text-sm'>VISUAL PHOTO</strong>
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - 90px)` }}>
            {data.map((d, i) => {
              const irImageUrl = d.image.irImageLabelUrl
              const visualImageUrl = d.image.visualImageLabelUrl
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '8px 16px', border: '1px solid #dee2e6', borderTop: 0 }} key={`asset-image-${i}`}>
                  <strong className='d-flex align-items-center text-sm'>{d.assetName}</strong>
                  <div className='d-flex align-items-center text-sm' style={{ marginRight: '5px' }}>
                    {d.assetClassName}
                  </div>
                  <div className='d-flex align-items-center'>
                    {/* <img alt='ERROR' src={invalidImages[irImageUrl] ? fallbackUrl : irImageUrl} width='56px' height='56px' style={{ marginRight: '12px' }} /> */}
                    <div
                      style={{
                        backgroundImage: `url(${!isEmpty(get(d, 'image.irImageLabelUrl', '')) ? (invalidImages[irImageUrl] ? fallbackUrl : irImageUrl) : URL.noImageAvailable})`,
                        backgroundSize: 'cover',
                        width: '56px',
                        marginRight: '12px',
                        height: '56px',
                        display: 'inline-block',
                        borderRadius: '4px',
                        position: 'relative',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                        marginTop: '5px',
                      }}
                      className='hover-photo'
                      onClick={() => handleImgPrivewBtn(get(d, 'image', null), 'irImageLabelUrl')}
                    >
                      {!invalidImages[irImageUrl] && (
                        <>
                          <IconButton
                            aria-label='close'
                            size='small'
                            onClick={e => {
                              handleUpload()
                              setImageURL(get(d, 'image.irImageLabelUrl', null))
                              e.stopPropagation()
                            }}
                            style={{ background: '#778899', position: 'absolute', right: '18px', top: '-12px' }}
                          >
                            <PublishOutlinedIcon style={{ color: '#fff' }} fontSize='small' />
                          </IconButton>
                          <IconButton
                            aria-label='close'
                            size='small'
                            onClick={e => {
                              setDeleteOpen(true)
                              setImageURL(get(d, 'image.irImageLabelUrl', null))
                              e.stopPropagation()
                            }}
                            style={{ background: '#ff2068', position: 'absolute', right: '-12px', top: '-12px' }}
                          >
                            <DeleteOutlineOutlinedIcon style={{ color: '#fff' }} fontSize='small' />
                          </IconButton>
                        </>
                      )}
                    </div>
                    <div>
                      {imageId === null || imageId !== `${get(d, 'image.irwoimagelabelmappingId', '')}ir` ? (
                        <div className='label-container'>
                          {!isEmpty(get(d, 'image.irImageLabel', '')) ? get(d, 'image.irImageLabel', '') : 'Unavailable'}
                          <IconButton aria-label='close' size='small' onClick={() => handleImgLableEditCLick(`${get(d, 'image.irwoimagelabelmappingId', '')}ir`, d, 'ir')} className='hover-lable-button'>
                            <EditOutlinedIcon style={{ marginLeft: '3px' }} />
                          </IconButton>
                        </div>
                      ) : (
                        <div className='d-flex align-items-center'>
                          <MinimalInput value={get(irPhotoNum, `imgValue`, '')} onChange={value => handlePhotoNumChange(d, value)} placeholder='Update IR Photo Label' w={55} style={{ marginTop: '10px' }} />
                          <FloatingButton onClick={handleClearBtn} icon={<CloseIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '30px', height: '30px', borderRadius: '4px' }} />
                          {updateLableLoading ? (
                            <CircularProgress size={20} thickness={5} style={{ color: theme.palette.primary.main, marginLeft: '5px' }} />
                          ) : (
                            <FloatingButton isLoading={updateLableLoading} onClick={() => handleOkBtn(d, 'ir')} icon={<DoneIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '30px', height: '30px', marginLeft: '5px', borderRadius: '4px' }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='d-flex align-items-center'>
                    {/* <img alt='ERROR' src={invalidImages[visualImageUrl] ? fallbackUrl : visualImageUrl} width='56px' height='56px' style={{ marginRight: '12px' }} /> */}
                    <div
                      style={{
                        backgroundImage: `url(${!isEmpty(get(d, 'image.visualImageLabelUrl', '')) ? (invalidImages[visualImageUrl] ? fallbackUrl : visualImageUrl) : URL.noImageAvailable})`,
                        backgroundSize: 'cover',
                        width: '56px',
                        marginRight: '12px',
                        height: '56px',
                        display: 'inline-block',
                        borderRadius: '4px',
                        position: 'relative',
                        cursor: 'pointer',
                        flex: '0 0 auto',
                        marginTop: '5px',
                      }}
                      className='hover-photo'
                      onClick={() => handleImgPrivewBtn(get(d, 'image', null), 'visualImageLabelUrl')}
                    >
                      {!invalidImages[visualImageUrl] && (
                        <>
                          {imageType !== enums.PHOTO_TYPE.IR_ONLY && (
                            <IconButton
                              aria-label='close'
                              size='small'
                              onClick={e => {
                                handleUpload()
                                setImageURL(get(d, 'image.irImageLabelUrl', null))
                                e.stopPropagation()
                              }}
                              style={{ background: '#778899', position: 'absolute', right: '18px', top: '-12px' }}
                            >
                              <PublishOutlinedIcon style={{ color: '#fff' }} fontSize='small' />
                            </IconButton>
                          )}
                          <IconButton
                            aria-label='close'
                            size='small'
                            onClick={e => {
                              setDeleteOpen(true)
                              setImageURL(get(d, 'image.visualImageLabelUrl', null))
                              e.stopPropagation()
                            }}
                            style={{ background: '#ff2068', position: 'absolute', right: '-12px', top: '-12px' }}
                          >
                            <DeleteOutlineOutlinedIcon style={{ color: '#fff' }} fontSize='small' />
                          </IconButton>
                        </>
                      )}
                    </div>
                    <div>
                      {imageId === null || imageId !== `${get(d, 'image.irwoimagelabelmappingId', '')}visual` ? (
                        <div className='label-container'>
                          {!isEmpty(get(d, 'image.visualImageLabel', '')) ? get(d, 'image.visualImageLabel', '') : 'Unavailable'}
                          <IconButton aria-label='close' size='small' onClick={() => handleImgLableEditCLick(`${get(d, 'image.irwoimagelabelmappingId', '')}visual`, d, 'visual')} className='hover-lable-button'>
                            <EditOutlinedIcon style={{ marginLeft: '3px' }} />
                          </IconButton>
                        </div>
                      ) : (
                        <div className='d-flex align-items-center'>
                          <MinimalInput value={get(irPhotoNum, `imgValue`, '')} onChange={value => handlePhotoNumChange(d, value)} placeholder='Update Visual Photo Label' w={55} style={{ marginTop: '10px' }} />
                          <FloatingButton onClick={handleClearBtn} icon={<CloseIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '30px', height: '30px', borderRadius: '4px' }} />
                          {updateLableLoading ? (
                            <CircularProgress size={20} thickness={5} style={{ color: theme.palette.primary.main, marginLeft: '5px' }} />
                          ) : (
                            <FloatingButton onClick={() => handleOkBtn(d, 'visual')} icon={<DoneIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '30px', height: '30px', marginLeft: '5px', borderRadius: '4px' }} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {isPreviewOpenForIr[0] && <ImagePreview open={isPreviewOpenForIr[0]} onClose={() => setPreviewOpenForIr([false, null, ''])} images={isPreviewOpenForIr[1]} urlKey={isPreviewOpenForIr[2]} hideRotateButton isFromIRImg />}
            {isDeleteOpen && <DialogPrompt title='Delete Photo' text='Are you sure you want to delete this Photo ?' open={isDeleteOpen} ctaText='Delete' action={e => (removeImage(), e.stopPropagation())} handleClose={e => (setDeleteOpen(false), e.stopPropagation())} />}
          </div>
          {!isEmpty(data) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={listSize} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
        </div>
      )}
    </div>
  )
}
export default UploadedPreview
