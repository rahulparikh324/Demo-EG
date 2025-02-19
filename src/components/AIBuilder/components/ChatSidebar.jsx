// ChatSidebar.js
import React from 'react'

import { styled, useTheme, AppBar as MuiAppBar, List, ListItem, ListItemIcon, ListItemText, Divider, Toolbar, Drawer, Box, IconButton, Typography, Button } from '@material-ui/core'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import MenuIcon from '@material-ui/icons/Menu'
import DescriptionIcon from '@material-ui/icons/Description'
import MailIcon from '@material-ui/icons/Mail'

import smallLogo from '../small-logo.png'
import useChatStoreV2 from '../store/chatStoreV2' // Import Zustand store
import useAuthStore from '../store/mockAuth'
import ProjectSelector from './ProjectSelector' // Import the ProjectSelector component
import ChatSidebarFileUpload from './ChatSidebarFileUpload' // Import the FileUpload component

const drawerWidth = 240

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: prop => prop !== 'open',
})(({ theme, open }) => ({
  color: 'black',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: 'transparent',
  boxShadow: 'none',
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

function ChatSidebar({
  open,
  handleDrawerOpen,
  handleDrawerClose,
  onSelectFile,
  onChangeProject,
  fetchProjects,
  projects = [], // Ensure projects has a default value
}) {
  const theme = useTheme()

  const { selectedProject, setSelectedProject, s3Contents, setSelectedFile, clearChat } = useChatStoreV2() // Get threadId and s3Contents from Zustand store
  const { setLoggedIn, setUsername } = useAuthStore() // Get loggedIn and setLoggedIn from Zustand store
  const sessionFiles = s3Contents[selectedProject.id] || [] // Get session files for the current threadId

  const handleChatClick = () => {
    setSelectedFile(null) // Reset the selected file to show ChatContainer
    handleDrawerClose() // Close the drawer
  }

  const handleFileClick = fileKey => {
    if (fileKey.endsWith('.csv')) {
      onSelectFile(fileKey) // Select the file
      handleDrawerClose() // Close the drawer
    }
  }

  const handleLogoutClick = () => {
    setLoggedIn(false) // Log out the user
    setUsername('') // Reset the userId
    handleDrawerClose() // Close the drawer
    setSelectedProject('') // Reset the selected project
    clearChat() // Clear the chat history
  }

  return (
    <Box sx={{ display: 'flex', position: 'sticky', left: 0, marginLeft: '20px', top: '64px' }}>
      {/* <AppBar position='fixed' open={open}> */}
      <IconButton color='inherit' aria-label='open drawer' onClick={handleDrawerOpen} edge='start' sx={{ mr: 2, ...(open && { display: 'none' }) }}>
        <MenuIcon />
      </IconButton>
      {/* </AppBar> */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            position: 'relative',
            boxSizing: 'border-box',
          },
        }}
        variant='temporary'
        anchor='left'
        open={open}
      >
        <DrawerHeader>
          {open && <img src={smallLogo} alt='Logo' style={{ height: '40px', marginRight: 'auto' }} />}
          <IconButton onClick={handleDrawerClose}>{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
        </DrawerHeader>
        <List>
          <ListItem disablePadding onClick={handleChatClick}>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary='Chat' />
          </ListItem>
        </List>
        <Divider />
        <Typography variant='subtitle2' sx={{ textAlign: 'left', padding: theme.spacing(2) }}>
          Facility
        </Typography>
        <List>
          {['Assets', 'PM Items', 'Locations', 'Digital One-Line'].map((text, index) => (
            <ListItem key={text} disablePadding onClick={handleDrawerClose}>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <Typography variant='subtitle2' sx={{ textAlign: 'left', padding: theme.spacing(2) }}>
          Project Files
        </Typography>
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            overflowX: 'hidden',
          }}
        >
          <List sx={{ flexGrow: 1, overflowY: 'scroll' }}>
            {sessionFiles.map(file => (
              <ListItem key={file.Key} disablePadding onClick={() => handleFileClick(file.Key)} sx={{ width: '240px', display: 'flex' }}>
                <ListItemIcon>{file.Key.endsWith('.csv') ? <DescriptionIcon /> : <DescriptionIcon />}</ListItemIcon>
                <ListItemText primary={file.Key.split('/').pop()} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}

export default ChatSidebar
