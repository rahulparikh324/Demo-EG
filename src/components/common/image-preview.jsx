import React, { useState, useRef } from 'react'

import Drawer from '@material-ui/core/Drawer'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import Rotate90DegreesCcwOutlinedIcon from '@material-ui/icons/Rotate90DegreesCcwOutlined'
import { MinimalButton } from 'components/common/buttons'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import { FormTitle } from 'components/Maintainance/components'
import { Toast } from 'Snackbar/useToast'

import { bucket } from 'Constants/aws-config'
import * as AWS from 'aws-sdk'
import { isEmpty } from 'lodash'
import constantURL from 'Constants/apiUrls'

const ImagePreview = ({ open, onClose, images, urlKey, forIrIndex, isForIR = false, imageIndex = 0, hideRotateButton = false, reFetch = () => {}, isFromIRImg = false }) => {
  const [index, setIndex] = useState(isForIR ? forIrIndex : imageIndex)
  const [angle, setAngle] = useState(0)
  const [isLoading, setLoading] = useState(false)
  const [randomValue, setRandomValue] = useState(Math.random())
  const imageRef = useRef(null)

  const handleRotation = async () => {
    const newRotations = (angle + 90) % 360
    setAngle(newRotations)
  }
  const handleAction = async () => {
    setLoading(true)
    return new Promise((resolve, reject) => {
      try {
        const width = imageRef.current.width
        const height = imageRef.current.height
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const image = new Image()
        image.onload = async function () {
          canvas.width = height
          canvas.height = width
          if (angle === 90) ctx.translate(canvas.width, 0)
          if (angle === 180) ctx.translate(canvas.width, canvas.height)
          if (angle === 270) ctx.translate(0, canvas.height)

          ctx.rotate((angle * Math.PI) / 180)
          ctx.drawImage(this, 0, 0, width, height)

          AWS.config.update(bucket.config)

          const s3 = new AWS.S3()

          canvas.toBlob(blob => {
            const url = new URL(images[index][urlKey])

            const pathSegments = url.href.split('/')
            const bucketName = pathSegments[isEmpty(pathSegments[3]) ? 4 : 3]

            const fileSegment = url.pathname.split(`${bucketName}/`)
            const fileName = fileSegment.pop()

            const params = { Bucket: bucketName, Key: decodeURI(fileName), Body: blob, ACL: 'public-read' }
            s3.upload(params, (err, data) => {
              if (err) {
                setLoading(false)
                Toast.error('Something went wrong')
                onClose()
                throw err
              } else {
                Toast.success('Image rotated successfully!')
                onClose()
                resolve({ success: true, data })
                setLoading(false)
                reFetch()
              }
            })
          })
        }
        image.crossOrigin = 'anonymous'
        image.src = images[index][urlKey] + `?value=${Math.random()}`
      } catch (error) {
        console.log(error)
        reject({ success: false, data: 'Error uploading data' })
      }
    })
  }

  const handleNextButton = () => {
    if (index !== images.length - 1) {
      setIndex(prev => prev + 1)
      setAngle(0)
    }
  }

  const handlePrevButton = () => {
    if (index !== 0) {
      setIndex(prev => prev - 1)
      setAngle(0)
    }
  }

  return (
    <>
      <Drawer anchor='right' open={open} onClose={onClose} style={{ position: 'relative' }}>
        <FormTitle title='Image Preview' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
        <div style={{ width: '95vw', height: hideRotateButton ? 'calc(100vh - 64px)' : 'calc(100vh - 145px)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }} className='d-flex'>
          <div onClick={handlePrevButton} style={{ height: '100%', width: '4%', cursor: index !== 0 ? 'pointer' : 'not-allowed' }} className='d-flex justify-content-center align-items-center'>
            <ChevronLeftIcon style={{ color: index !== 0 ? '#121212' : '#b9b4b4' }} />
          </div>
          <div style={{ width: '80%', height: 'calc(100vh - 150px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {isForIR ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '48%', height: '100%' }}>
                  <h2>Visual Photo</h2>
                  <div id='asset-image-container' style={{ width: '100%', height: 'calc(100% - 100px)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundImage: `url(${encodeURI(isEmpty(images[index][urlKey]) ? constantURL.noImageAvailable : images[index][urlKey])})` }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '48%', height: '100%' }}>
                  <h2>IR Photo</h2>
                  <div id='asset-image-container' style={{ width: '100%', height: 'calc(100% - 100px)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundImage: `url(${encodeURI(images[index]['irImageLabelUrl'])})` }} />
                </div>
              </>
            ) : (
              <div id='asset-image-container' style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                <div>
                  {images[index] && images[index][urlKey] && (
                    <img
                      ref={imageRef}
                      src={isFromIRImg ? images[index][urlKey] : `${encodeURI(isEmpty(images[index][urlKey]) ? constantURL.noImageAvailable : images[index][urlKey])}?value=${randomValue}`}
                      style={{
                        maxWidth: 'calc(-150px + 100vh)',
                        maxHeight: 'calc(-150px + 100vh)',
                        transform: `rotate(${angle}deg)`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div onClick={handleNextButton} style={{ height: '100%', width: '4%', cursor: index !== images.length - 1 ? 'pointer' : 'not-allowed' }} className='d-flex justify-content-center align-items-center'>
            <ChevronRightIcon style={{ color: index !== images.length - 1 ? '#121212' : '#b9b4b4' }} />
          </div>
        </div>

        {!hideRotateButton && (
          <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
            <MinimalButton text='Cancel' variant='contained' color='default' baseClassName='mt-2 mb-2' onClick={onClose} style={{ width: '100px' }} />
            <div>
              <MinimalButton text='Rotate' startIcon={<Rotate90DegreesCcwOutlinedIcon />} variant='outlined' baseClassName='mt-2 mb-2' onClick={handleRotation} style={{ width: '100px', marginRight: '10px' }} />
              <Button variant='contained' color='primary' className='mt-2 mb-2 nf-buttons' onClick={handleAction} style={{ width: '100px' }} disableElevation disabled={angle === 0 || isLoading}>
                Save
                {isLoading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}

export default ImagePreview
