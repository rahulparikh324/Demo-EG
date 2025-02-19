import React, { useEffect, useState, useRef } from 'react'

import { AssetImage, photoTypes } from 'components/WorkOrders/onboarding/utils'
import ImagePreview from 'components/common/image-preview'
import DialogPrompt from 'components/DialogPrompt'
import { ElipsisWithTootip, Menu } from 'components/common/others'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'
import { get, isEmpty, uniqBy } from 'lodash'
import asset from 'Services/assets'

import CircularProgress from '@material-ui/core/CircularProgress'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined'

import enums from 'Constants/enums'
import './style.css'

const Photos = ({ assetId, refetch, setProfileUrl, photoRefetch }) => {
  const [isPreviewOpen, setPreviewOpen] = useState([false, 0])
  const [imageOrder, setImageOrder] = useState(0)
  const [randomValue, setRandomValue] = useState(Math.random())
  const [anchorObj, setAnchorObj] = useState({})
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isProfilePhotoOpen, setProfilePhotoOpen] = useState(false)
  const [currectProfilePhoto, setCurrentProfilePhoto] = useState('')
  const isFirstRender = useRef(true)

  const { data, loading, reFetch } = useFetchData({ fetch: asset.photos.getAllImagesForAsset, payload: assetId, formatter: d => get(d, 'data', {}) })

  const uniqueCategories = uniqBy(get(data, 'assetImageList', []), 'assetPhotoType')

  const Info = ({ label, value, style = {} }) => (
    <div style={style}>
      <div className='text-xs text-bold'>{label}:</div>
      <div className='text-xs' style={{ fontWeight: 500, wordWrap: 'break-word', color: '#5e5e5e', marginLeft: '4px' }}>
        {value}
      </div>
    </div>
  )

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    reFetch()
  }, [photoRefetch])

  const handleAssetImage = index => {
    setPreviewOpen(true)
    setImageOrder(index)
  }

  const handleCategory = assetPhotoType => {
    const photosType = enums.PHOTOS?.find(d => d.value === assetPhotoType)
    return get(photosType, 'label', '')
  }

  const handleDateFormate = d => {
    const newDate = new Date(d.createdAt)
    const formattedDate = newDate.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
    return formattedDate
  }

  const menuOptions = [
    { id: 1, name: 'Set as Profile Photo', action: d => handleAction('PROFILE', d) },
    { id: 2, name: 'Delete', action: d => handleAction('DELETE', d), color: '#FF0000' },
  ]

  const handleAction = async (type, obj) => {
    setAnchorObj(obj)
    if (type === 'DELETE') setDeleteOpen(true)
    if (type === 'PROFILE') setProfilePhotoOpen(true)
  }

  const payload = {
    assetId,
    assetProfileImagesId: get(anchorObj, 'assetProfileImagesId', null),
    assetirwoimageslabelmappingId: get(anchorObj, 'assetirwoimageslabelmappingId', null),
    assetIssueImageMappingId: get(anchorObj, 'assetIssueImageMappingId', null),
    assetImageUrl: get(anchorObj, 'assetImageUrl', ''),
    is_deleted: isDeleteOpen ? true : false,
  }

  const handlePostDelete = () => {
    reFetch()
    refetch()
    setProfileUrl('')
    setDeleteOpen(false)
  }

  const handlePostSetProfile = () => {
    setProfilePhotoOpen(false)
    setProfileUrl(get(anchorObj, 'assetImageUrl', ''))
    setCurrentProfilePhoto(get(anchorObj, 'assetImageUrl', ''))
  }

  const { loading: deleteLoading, mutate: deletePhoto } = usePostData({ executer: asset.photos.deleteOrSetAsProfile, postSuccess: handlePostDelete, message: { success: 'Photo deleted successfully !', error: 'Something went wrong !' } })
  const handleDeletePhoto = () => deletePhoto(payload)

  const { loading: profilePhotoLoading, mutate: setProfilePhoto } = usePostData({ executer: asset.photos.deleteOrSetAsProfile, postSuccess: handlePostSetProfile, message: { success: 'Asset profile photo set successfully !', error: 'Something went wrong !' } })
  const handleSetProfilePhoto = () => setProfilePhoto(payload)

  return (
    <div style={{ height: 'calc(100% - 42px)', minHeight: '400px' }}>
      {loading ? (
        <div className='d-flex justify-content-center align-items-center ml-3' style={{ height: 'calc(100vh - 300px)' }}>
          <CircularProgress size={24} thickness={5} />
        </div>
      ) : isEmpty(get(data, 'assetImageList', [])) ? (
        <div className='d-flex flex-column justify-content-center align-items-center ml-3' style={{ height: 'calc(100vh - 300px)', fontWeight: 800 }}>
          <PhotoLibraryOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />
          <div style={{ color: '#666', marginTop: '12px' }}>No photos found!</div>
        </div>
      ) : (
        <>
          {uniqueCategories.map(category => {
            const filteredImages = get(data, 'assetImageList', []).filter(d => d.assetPhotoType === category.assetPhotoType)

            if (filteredImages.length === 0) return null

            return (
              <div key={category.assetPhotoType}>
                <div style={{ padding: '12px', borderRadius: '4px 4px 0 0', fontSize: '16px' }}>
                  <div className='text-bold'>{handleCategory(category.assetPhotoType)}</div>
                </div>
                <div className='d-flex flex-wrap'>
                  {filteredImages.map((d, index) => (
                    <div
                      className='border rounded imageContainer'
                      style={{ margin: '10px', position: 'relative', cursor: 'pointer' }}
                      onClick={() => {
                        setPreviewOpen([true, category.assetPhotoType])
                        setImageOrder(index)
                      }}
                      key={index}
                    >
                      <div className='imageHover'>
                        <AssetImage key={`asset-image-${d.assetImageName}`} readOnly url={`${d.assetImageUrl}?value=${randomValue}`} width='170px' height='150px' baseMargin randomValue isIrPhotos={category.assetPhotoType === enums.PHOTOS[10].value || category.assetPhotoType === enums.PHOTOS[11].value ? true : false} />
                        <div className='overlay'>
                          <div style={{ position: 'absolute', right: '0px', top: '5px' }}>
                            <Menu options={menuOptions} data={d} isIconInWhite isPhotosTab width={160} />
                          </div>
                          <div className='icon'>
                            <VisibilityOutlinedIcon style={{ color: 'white' }} />
                          </div>
                        </div>
                        <div className='info p-2'>
                          {/* <Info label='Category' value={handleCategory(d.assetPhotoType)} style={{ display: 'flex' }} /> */}
                          <Info label='Date' value={handleDateFormate(d)} style={{ display: 'flex' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* {isPreviewOpen && <ImagePreview open={isPreviewOpen} onClose={() => setPreviewOpen(false)} imageIndex={imageOrder} images={get(data, 'assetImageList', [])} urlKey='assetImageUrl' reFetch={() => setRandomValue(Math.random())} />} */}
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreviewOpen([false, 0])} imageIndex={imageOrder} images={get(data, 'assetImageList', []).filter(d => d.assetPhotoType === isPreviewOpen[1])} urlKey='assetImageUrl' reFetch={() => setRandomValue(Math.random())} />}
      {isDeleteOpen && (
        <DialogPrompt
          title='Delete Photo'
          text={currectProfilePhoto === get(anchorObj, 'assetImageUrl', '') ? 'By deleting this photo, Profile photo will get removed. Do you still want to proceed ?' : 'Are you sure you want to delete this Photo ?'}
          actionLoader={deleteLoading}
          open={isDeleteOpen}
          ctaText='Delete'
          action={handleDeletePhoto}
          handleClose={() => setDeleteOpen(false)}
        />
      )}
      {isProfilePhotoOpen && <DialogPrompt title='Set Profile Photo' text='Would you like to set this photo as asset profile photo ?' actionLoader={profilePhotoLoading} open={isProfilePhotoOpen} ctaText='Update' action={handleSetProfilePhoto} handleClose={() => setProfilePhotoOpen(false)} />}
    </div>
  )
}

export default Photos
