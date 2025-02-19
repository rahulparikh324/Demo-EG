import React, { useState, useEffect, useRef } from 'react'
import useFetchData from 'hooks/fetch-data'
import { Toast } from 'Snackbar/useToast'
import { get, isEmpty, orderBy } from 'lodash'

import ImageSearchOutlinedIcon from '@material-ui/icons/ImageSearchOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import { IconButton, TablePagination } from '@material-ui/core'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import deleteBucketObject from 'Services/WorkOrder/delete-bucket-obj'

import DialogPrompt from 'components/DialogPrompt'
import { MinimalButton } from 'components/common/buttons'

import { snakifyKeys } from 'helpers/formatters'

import enums from 'Constants/enums'
import URL from 'Constants/apiUrls'
import ImagePreview from 'components/common/image-preview'

const UploadedPhotosPreview = ({ workOrderID, imageType }) => {
  const [invalidImages, setInvalidImages] = useState({})
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [imageURL, setImageURL] = useState(null)
  const [isPreviewOpenForIr, setPreviewOpenForIr] = useState([false, null, ''])
  const [imageIndex, setImageIndex] = useState(0)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(1)
  const [listSize, setListSize] = useState(0)

  const formatDetails = d => {
    const list = get(d, 'data.list', [])
    setListSize(get(d, 'data.listsize', 0))
    const images = []
    list.forEach(asset => {
      get(asset, 'obIrImageLabelList', []).forEach(image => {
        images.push({ assetName: asset.assetName, url: get(image, 'irImageLabelUrl', null), label: get(image, 'irImageLabel', '') })
        images.push({ assetName: asset.assetName, url: get(image, 'visualImageLabelUrl', null), label: get(image, 'visualImageLabel', '') })
      })
    })
    const sortedData = orderBy(images, [e => !isEmpty(e.label) && e.label.toLowerCase()], ['asc'])
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
        d.url = !isEmpty(d.url) ? handleEncodeURL(d.url) + '?value=' + Math.random() : d.url
        checkImageValidity(d.url)
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

  const handleImgPrivewBtn = (data, key) => {
    setPreviewOpenForIr([true, data, key])
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
    <div style={{ height: 'calc(100vh - 170px)', width: '100%', minWidth: '700px', padding: '12px' }}>
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
        <div style={{ height: '100%', width: '100%' }}>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100% - 45px)` }}>
            <div className='p-1 d-flex flex-wrap' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
              {data.map((d, i) => (
                <div className='border rounded' style={{ margin: '10px', position: 'relative', cursor: 'pointer', width: 'calc(100%/5 - 20px)' }} key={i}>
                  <div
                    className='hover-photo'
                    style={{ backgroundImage: `url(${!isEmpty(get(d, 'url', '')) ? (invalidImages[d.url] ? fallbackUrl : d.url) : URL.noImageAvailable})`, backgroundSize: 'cover', width: '100%', height: '190px', position: 'relative', cursor: 'pointer', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}
                    onClick={() => (handleImgPrivewBtn(data, 'irImageLabelUrl'), setImageIndex(i))}
                  >
                    {!invalidImages[d.url] && (
                      <>
                        <IconButton
                          aria-label='close'
                          size='small'
                          onClick={e => {
                            setDeleteOpen(true)
                            setImageURL(d.url)
                            e.stopPropagation()
                          }}
                          style={{ background: '#ff2068', position: 'absolute', right: '-12px', top: '-12px' }}
                        >
                          <DeleteOutlineOutlinedIcon style={{ color: '#fff' }} fontSize='medium' />
                        </IconButton>
                      </>
                    )}
                  </div>
                  <div class='info p-2' style={{ borderTop: '1px solid #dee2e6' }}>
                    <div className='text-xs' style={{ fontWeight: 500, wordWrap: 'break-word', color: '#5e5e5e', marginLeft: '4px' }}>
                      {d.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isPreviewOpenForIr[0] && <ImagePreview open={isPreviewOpenForIr[0]} onClose={() => setPreviewOpenForIr([false, null, ''])} imageIndex={imageIndex} images={data} urlKey='url' hideRotateButton isFromIRImg />}
            {isDeleteOpen && <DialogPrompt title='Delete Photo' text='Are you sure you want to delete this Photo ?' open={isDeleteOpen} ctaText='Delete' action={e => (removeImage(), e.stopPropagation())} handleClose={e => (setDeleteOpen(false), e.stopPropagation())} />}
          </div>
          {!isEmpty(data) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={listSize} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
        </div>
      )}
    </div>
  )
}
export default UploadedPhotosPreview
