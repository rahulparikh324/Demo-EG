import React, { useState, useEffect } from 'react'
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import EditIcon from '@material-ui/icons/Edit'
import { Autocomplete } from '@material-ui/lab'

import authStore from '../store/mockAuth'
import useChatStoreV2 from '../store/chatStoreV2'

const AddProjectModal = ({ open, onClose, onAddProject }) => {
  const [projectName, setProjectName] = useState('')

  const handleProjectNameChange = e => setProjectName(e.target.value)

  const handleAddProject = () => {
    onAddProject(projectName)
    setProjectName('')
  }

  const handleClose = () => {
    onClose()
    setProjectName('')
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Project</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin='dense' label='Project Name' type='text' fullWidth value={projectName} onChange={handleProjectNameChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAddProject} variant='contained'>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const EditProjectModal = ({ open, onClose, projectToEdit, onSaveProject, deleteMode, setDeleteMode, onDeleteProject }) => {
  const [projectToEditName, setProjectToEditName] = useState('')

  useEffect(() => {
    if (projectToEdit) {
      setProjectToEditName(projectToEdit.name)
    }
  }, [projectToEdit])

  const handleProjectNameChange = e => setProjectToEditName(e.target.value)

  const handleSaveProject = () => {
    onSaveProject(projectToEdit.id, projectToEditName)
  }

  const handleClose = () => {
    onClose()
    setProjectToEditName('')
    setTimeout(() => {
      setDeleteMode(false)
    }, 500)
  }

  const handleDeleteProject = () => {
    onDeleteProject(projectToEdit.id)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      {deleteMode ? (
        <>
          <DialogTitle>
            <b>ARE YOU SURE?</b>
          </DialogTitle>
          <DialogContent>
            <Typography>This action cannot be undone. Proceed with caution.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleDeleteProject}
              variant='contained'
              sx={{
                bgcolor: 'red',
                color: 'white',
              }}
            >
              YES, DELETE
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin='dense' label='Project Name' type='text' fullWidth value={projectToEditName} onChange={handleProjectNameChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSaveProject} variant='contained'>
              Save
            </Button>
            <Button
              onClick={() => setDeleteMode(true)}
              variant='contained'
              sx={{
                bgcolor: 'red',
                color: 'white',
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

const ProjectSelector = ({ selectedProject, setSelectedProject, onChangeProject }) => {
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [hoveredProject, setHoveredProject] = useState(null)
  const { username } = authStore()
  const { projects, fetchProjects } = useChatStoreV2()

  const handleOpenAddModal = () => setOpenAddModal(true)
  const handleCloseAddModal = () => setOpenAddModal(false)

  const handleOpenEditModal = project => {
    setProjectToEdit(project)
    setOpenEditModal(true)
  }
  const handleCloseEditModal = () => {
    setOpenEditModal(false)
    setProjectToEdit(null)
  }

  const handleAddProject = async projectName => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: projectName, username: username }),
    }

    try {
      const response = await fetch('https://i8pc5k8px0.execute-api.us-west-2.amazonaws.com/dev/projects/create-project', requestOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add the project')
      }

      // Optionally, handle the data
      console.log('Project added:', data)

      const newProject = {
        id: data.project_id,
        name: data.project_name,
      }

      console.log(newProject)

      // Re-fetch projects
      fetchProjects(username)
      // Set the current project to the newly-created project
      setSelectedProject(newProject)
    } catch (error) {
      console.error('Error adding project:', error.message)
      alert('Error adding project: ' + error.message)
    }

    handleCloseAddModal() // Ensure handleClose is called regardless of success or failure
  }

  const handleSaveProject = async (projectId, projectName) => {
    const requestOptions = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName: projectName }),
    }

    try {
      const response = await fetch(`https://i8pc5k8px0.execute-api.us-west-2.amazonaws.com/dev/projects/edit-project-name?projectId=${projectId}`, requestOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update the project')
      }

      // Optionally, handle the data
      console.log('Project updated:', data)

      // Re-fetch projects
      const updatedProjects = await fetchProjects(username)

      // Find and set the updated project
      const updatedProject = updatedProjects.find(project => project.id === projectId)
      if (updatedProject) {
        setSelectedProject(updatedProject)
      }
    } catch (error) {
      alert('Error updating project: ' + error.message)
    }

    handleCloseEditModal() // Ensure handleClose is called regardless of success or failure
  }

  const handleDeleteProject = async projectId => {
    console.log('handleDeleteProject invoked')
    console.log('projectId:', projectId)
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }

    try {
      const response = await fetch(`https://i8pc5k8px0.execute-api.us-west-2.amazonaws.com/dev/projects/delete-project?projectId=${projectId}`, requestOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete the project')
      }

      // Optionally, handle the data
      console.log('Project deleted:', data)

      // Re-fetch projects
      fetchProjects(username)
      // Clear the current project if it was deleted
      if (selectedProject?.id === projectId) {
        setSelectedProject('')
      }
    } catch (error) {
      console.error('Error deleting project:', error.message)
      alert('Error deleting project: ' + error.message)
    }

    handleCloseEditModal()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        m: 2,
      }}
    >
      <Autocomplete
        value={selectedProject || null}
        onChange={(event, newValue) => {
          onChangeProject(newValue)
        }}
        options={projects}
        getOptionLabel={option => option.name || ''}
        renderInput={params => <TextField {...params} label='Select Project' />}
        renderOption={(props, option) => {
          const { key, ...rest } = props
          return (
            <Box
              component='li'
              key={option.id} // Pass the key directly to the Box component
              {...rest}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%', // Ensuring the box takes the full width of the dropdown
                position: 'relative', // Required for the absolute positioning of the edit icon
              }}
              onMouseEnter={() => setHoveredProject(option)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <Box sx={{ flexGrow: 1 }}>{option.name}</Box>
              {hoveredProject?.id === option.id && (
                <IconButton
                  onClick={e => {
                    e.stopPropagation() // Prevents the option from being selected when clicking the icon
                    handleOpenEditModal(option)
                    setHoveredProject(null) // Clear the hovered project
                  }}
                  sx={{
                    position: 'absolute', // Absolutely position the edit icon
                    right: 0, // Align it to the right
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          )
        }}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false
          return option.id === value.id
        }}
        sx={{
          width: 240,
          height: '48px',
        }}
      />
      <Button variant='contained' sx={{ marginLeft: 1, height: '48px', maxWidth: '48px', marginTop: 1 }} onClick={handleOpenAddModal}>
        <AddIcon />
      </Button>
      <AddProjectModal open={openAddModal} onClose={handleCloseAddModal} onAddProject={handleAddProject} />
      <EditProjectModal open={openEditModal} onClose={handleCloseEditModal} projectToEdit={projectToEdit} onSaveProject={handleSaveProject} deleteMode={deleteMode} setDeleteMode={setDeleteMode} onDeleteProject={handleDeleteProject} />
    </Box>
  )
}

export default ProjectSelector
