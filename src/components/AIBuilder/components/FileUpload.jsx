import React, { useState, useEffect } from 'react'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { Button, Box, Typography, CircularProgress } from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import useChatStore from '../store/chatStore' // Correctly import Zustand store
import './styles.css'

const FileUpload = ({ threadId }) => {
  const [uploadStatus, setUploadStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetchS3Contents = useChatStore(state => state.fetchS3Contents) // Get the fetch function from the store

  const s3Client = new S3Client({
    region: process.env.REACT_APP_VITE_AWS_REGION,
    credentials: {
      accessKeyId: process.env.REACT_APP_VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_VITE_AWS_SECRET_ACCESS_KEY,
    },
  })

  useEffect(() => {
    return () => {
      // Cleanup function to be called when the component unmounts
      setLoading(false)
      setUploadStatus(null)
    }
  }, [])

  const handleFileChange = async event => {
    if (!threadId || threadId === 'new_thread_id') {
      alert('Thread ID is missing or invalid')
      return
    }

    const files = Array.from(event.target.files)
    if (files.length === 0) {
      return // No files selected, do nothing
    }

    setLoading(true)
    setUploadStatus(null)

    const uploadPromises = files.map(async file => {
      const fileKey = `sessions/${threadId}/${file.name}`
      const params = {
        Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
        Key: fileKey,
        Body: file,
        ContentType: file.type,
      }
      const command = new PutObjectCommand(params)
      try {
        await s3Client.send(command)
        console.log(`${file.name} uploaded successfully`)
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err)
        throw new Error(`Error uploading ${file.name}: ${err.message}`)
      }
    })

    try {
      await Promise.all(uploadPromises)
      setUploadStatus('All files uploaded successfully')
      console.log('All files uploaded successfully')
      // Clear the upload status message after 5 seconds
      setTimeout(() => {
        setUploadStatus(null)
      }, 5000)
    } catch (err) {
      setUploadStatus('Error uploading some files: ' + err.message)
      console.error('Error uploading files:', err)
    } finally {
      if (threadId) {
        await fetchS3Contents(threadId) // Fetch the latest contents after upload
      }
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'relative', textAlign: 'center' }}>
      <input type='file' multiple onChange={handleFileChange} style={{ display: 'none' }} id='file-upload-input' disabled={!threadId || threadId === 'new_thread_id'} />
      <label htmlFor='file-upload-input'>
        <Button variant='contained' component='span' startIcon={<CloudUploadIcon />} disabled={!threadId || threadId === 'new_thread_id'} sx={{ position: 'relative', zIndex: 1 }}>
          {loading ? <CircularProgress size={24} /> : 'Upload files'}
        </Button>
      </label>
      {uploadStatus && (
        <Typography
          variant='body1'
          sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            mt: 1,
            color: uploadStatus.includes('Error') ? 'red' : 'green',
            zIndex: 0,
          }}
        >
          {uploadStatus}
        </Typography>
      )}
    </Box>
  )
}

export default FileUpload
