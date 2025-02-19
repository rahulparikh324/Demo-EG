import React, { useState, useEffect } from 'react'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

import { Button, Box, CircularProgress } from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'

import useChatStoreV2 from '../store/chatStoreV2' // Correctly import Zustand store
import './styles.css'

const ChatSidebarFileUpload = () => {
  const [loading, setLoading] = useState(false)
  const fetchS3Contents = useChatStoreV2(state => state.fetchS3Contents) // Get the fetch function from the store
  const selectedProject = useChatStoreV2(state => state.selectedProject)

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
    }
  }, [])

  const handleFileChange = async event => {
    if (!selectedProject.id) {
      alert('Project ID is missing or invalid')
      return
    }

    const files = Array.from(event.target.files)
    if (files.length === 0) {
      return // No files selected, do nothing
    }

    setLoading(true)

    const uploadPromises = files.map(async file => {
      const fileKey = `projects/${selectedProject.id}/${file.name}`
      const params = {
        Bucket: process.env.VITE_S3_BUCKET_NAME,
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
      console.log('All files uploaded successfully')
    } catch (err) {
      console.error('Error uploading files:', err)
    } finally {
      if (selectedProject.id) {
        await fetchS3Contents(selectedProject.id) // Fetch the latest contents after upload
      }
      setLoading(false)
    }
  }

  return (
    <Box sx={{ position: 'relative', textAlign: 'center' }}>
      <input type='file' multiple onChange={handleFileChange} style={{ display: 'none' }} id='file-upload-input' disabled={selectedProject.id == ''} />
      <label htmlFor='file-upload-input'>
        <Button variant='contained' component='span' startIcon={<CloudUploadIcon />} disabled={selectedProject.id == ''} sx={{ position: 'relative', zIndex: 1 }}>
          {loading ? <CircularProgress size={24} /> : 'Upload files'}
        </Button>
      </label>
    </Box>
  )
}

export default ChatSidebarFileUpload
