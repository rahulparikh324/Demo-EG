import React, { useState, useEffect } from 'react'
import { styled, Typography, ThemeProvider, CssBaseline, Box } from '@material-ui/core'

// Internal
import S3DataGridContainer from './components/S3DataGridContainer'
import useAuthStore from './store/mockAuth'
import useChatStoreV2 from './store/chatStoreV2'
import MockLogin from './components/MockLogin'
import ChatSidebar from './components/ChatSidebar'
import ChatContainer from './components/ChatContainer'
import theme from './theme'
import { get, isEmpty } from 'lodash'
import { camelizeKeys } from 'helpers/formatters'

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

const AIBuilder = () => {
  const [open, setOpen] = useState(false)
  const { username, loggedIn } = useAuthStore() // Use Zustand store
  const { selectedFile, setSelectedFile, selectedProject, setSelectedProject, fetchS3Contents, projects, fetchProjects, setProjects } = useChatStoreV2() // Use Zustand store

  const userInfo = camelizeKeys(JSON.parse(localStorage.getItem('loginData')))
  const userObj = isEmpty(JSON.parse(localStorage.getItem('userObj'))) ? { firstname: get(userInfo, 'firstname', ''), lastname: get(userInfo, 'lastname', '') } : JSON.parse(localStorage.getItem('userObj'))

  useEffect(() => {
    if (loggedIn) {
      fetchProjects(username)
    }
  }, [loggedIn, username, fetchProjects])

  const handleSelectFile = fileKey => {
    setSelectedFile(fileKey)
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleProjectChange = newValue => {
    if (newValue && newValue.id) {
      console.log(newValue.id)
      setSelectedProject(newValue)
      fetchS3Contents(newValue.id)
    } else {
      setSelectedProject('')
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!loggedIn ? (
          <MockLogin />
        ) : (
          <>
            {/* <ChatSidebar open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} onSelectFile={handleSelectFile} selectedProject={selectedProject} onChangeProject={handleProjectChange} projects={projects} setSelectedProject={setSelectedProject} fetchProjects={fetchProjects} /> */}
            {/* <DrawerHeader /> */}
            <Typography variant='h3' style={{ margin: '16px' }}>
              Welcome, {`${userObj.firstname} ${userObj.lastname}`}
            </Typography>
            {selectedFile ? <S3DataGridContainer fileKey={selectedFile} height='80%' width='100%' /> : <ChatContainer selectedProject={selectedProject} />}
          </>
        )}
      </Box>
    </ThemeProvider>
  )
}

export default AIBuilder
