import { useState } from 'react'

import { Typography, TextField, Button, Box } from '@material-ui/core'
import { useStore } from 'zustand'
import useAuthStore from '../store/mockAuth'

const MockLogin = () => {
  const { setUsername, setLoggedIn } = useStore(useAuthStore)
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')

  const handleClick = async () => {
    if (usernameInput === '' || passwordInput === '') {
      alert('Please enter a username and password')
      return
    }

    try {
      // Simulate authentication
      const response = await handleAuth(usernameInput)

      if (response.user_exists === true) {
        setUsername(usernameInput)
        setLoggedIn(true)
      } else {
        alert('User does not exist!')
      }
    } catch (error) {
      alert('An error occurred during authentication. Please try again.')
    }
  }

  const handleAuth = async username => {
    // Simulate authentication
    try {
      const response = await fetch(`https://i8pc5k8px0.execute-api.us-west-2.amazonaws.com/dev/auth?username=${username}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to authenticate user', error)
      throw error
    }
  }

  const handleChangeUsername = event => {
    setUsernameInput(event.target.value)
  }

  const handleChangePassword = event => {
    setPasswordInput(event.target.value)
  }

  return (
    <Box
      minWidth='240px'
      sx={{
        height: '30%',
        width: '20%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant='h3' sx={{ m: 2 }}>
        Login
      </Typography>
      <TextField fullWidth id='username' label='Username' variant='outlined' onChange={handleChangeUsername} autoFocus />
      <TextField fullWidth id='password' label='Password' type='password' variant='outlined' sx={{ m: 2 }} onChange={handleChangePassword} />
      <Button variant='contained' sx={{ width: '40%' }} onClick={handleClick}>
        Login
      </Button>
    </Box>
  )
}

export default MockLogin
