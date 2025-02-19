import React from 'react'
import { Box, Typography } from '@material-ui/core'

const ChatThread = ({ threadId }) => {
  return (
    <Box>
      <Typography variant='body2'>
        <b>Thread ID:</b> {threadId}
      </Typography>
    </Box>
  )
}

export default ChatThread
