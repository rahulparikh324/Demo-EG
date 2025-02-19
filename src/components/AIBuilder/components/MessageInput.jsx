// src/components/MessageInput.jsx
import React, { useEffect, useRef } from 'react'
import { TextField, Button, Box, InputAdornment } from '@material-ui/core'

const MessageInput = ({ message, handleInputChange, handleClick, isLoading, isPolling, placeholder, selectedProject, isWaitingForResponse, isResponding }) => {
  const textAreaRef = useRef(null)

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = event => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        if (message.trim()) {
          handleClick()
        }
      }
    }

    // Add event listener for keydown events
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClick, message])

  return (
    <Box display='flex' flexDirection='column' alignItems='stretch' width='100%'>
      <TextField
        inputRef={textAreaRef}
        value={message}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={isLoading || isPolling || isWaitingForResponse || isResponding}
        multiline
        rows={3}
        variant='outlined'
        fullWidth
        margin='normal'
        sx={{ backgroundColor: 'white' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Button onClick={handleClick} variant='contained' color='primary' disabled={isLoading || isPolling || !message.trim() || isWaitingForResponse || isResponding}>
                Send
              </Button>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}

export default MessageInput
