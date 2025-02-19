import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Box, Typography, Avatar } from '@material-ui/core'
import smallLogo from '../small-logo.png' // Adjust the path as necessary

const Message = ({ sender, text }) => {
  return (
    <Box display='flex' flexDirection='column' alignItems={sender === 'user' ? 'flex-end' : 'flex-start'} className={`chat-message-container ${sender}`} sx={{ mb: 0 }}>
      <Typography variant='subtitle2' color='textSecondary'>
        {sender === 'user' ? 'user' : 'egalvanic'}
      </Typography>
      <Box
        display='flex'
        alignItems='center'
        sx={{
          backgroundColor: sender === 'user' ? '#cce5ff' : '#ffffff',
          borderRadius: '16px',
          padding: '16px',
          maxWidth: '80%',
          minWidth: '',
          wordWrap: 'break-word',
          textAlign: 'left',
        }}
      >
        {sender === 'system' && <Avatar src={smallLogo} alt='Logo' sx={{ width: 24, height: 24, mr: 2 }} />}
        <Typography variant='body1' component='div' style={{ marginBlockStart: '1rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </Typography>
      </Box>
    </Box>
  )
}

export default Message
