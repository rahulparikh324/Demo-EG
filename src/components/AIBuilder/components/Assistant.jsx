// src/components/Assistant.jsx
import React from 'react'
import { FormControl, InputLabel, Select, MenuItem, Box } from '@material-ui/core'

const Assistant = ({ assistant, handleAssistantChange, selectedProject }) => {
  const handleChange = event => {
    const newAssistant = event.target.value
    handleAssistantChange(newAssistant)
  }

  return (
    <Box>
      <FormControl fullWidth variant='outlined'>
        <InputLabel id='assistant-label'>Select AI</InputLabel>
        <Select
          labelId='assistant-label'
          id='assistant'
          disabled={!selectedProject}
          value={assistant}
          onChange={handleChange}
          label='Select AI'
          sx={{ textAlign: 'left' }} // Ensure the label text is aligned properly
        >
          <MenuItem value='asst_3ZPqjgfsdHNLB0i7tjJ5W6yB'>General Chat</MenuItem>
          <MenuItem value='asst_uRc7EfqwnxZbfwdONNR8mg3W'>Quote Builder</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default Assistant
