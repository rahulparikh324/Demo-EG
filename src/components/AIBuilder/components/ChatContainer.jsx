import React, { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'

import { IconButton, Box, Container } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'

import MessageContainerV2 from './MessageContainerV2'
import MessageInput from './MessageInput'
import Assistant from './Assistant'
import Spinner from './Spinner'
import Modal from './Modal'
import useChatStoreV2 from '../store/chatStoreV2'
import ChatThread from './ChatThread'

import './styles.css'
import GetAwsAuthCredetial from 'Actions/GetAwsAuthCredetialAction'
import getDomainName from 'helpers/getDomainName'

const ChatContainer = ({ selectedProject }) => {
  const {
    message,
    chatHistory,
    threadId,
    isLoading,
    isResponding,
    isWaitingForResponse,
    assistant,
    showModal,
    newAssistant,
    setMessage,
    addMessageToHistory,
    setThreadId,
    setIsLoading,
    setIsWaitingForResponse,
    setIsResponding,
    clearChat,
    setAssistant,
    setShowModal,
    setNewAssistant,
    getLatestSystemMessage,
    setLatestSystemMessage,
    replaceLatestMessageWithImmutable,
    clearLatestSystemMessage,
    setS3WebSocketConnection,
    setChatWebSocketConnection,
    fetchS3Contents,
    getLatestMessageRole,
    getLatestMessageContent,
    s3Contents,
  } = useStore(useChatStoreV2)

  const messageEndRef = useRef(null)
  const [placeholder, setPlaceholder] = useState(getInitialPlaceholder(assistant))

  const [modalAction, setModalAction] = useState(null) // State to manage the type of action triggering the modal
  const wsRef = useRef(null) // Ref to keep track of Chat WebSocket instance
  const s3wsRef = useRef(null) // Ref to keep track of S3 WebSocket instance
  const pendingMessages = useRef([]) // Ref to store messages pending to be sent

  const handleInputChange = event => {
    setMessage(event.target.value)
  }

  const getInitialThreadId = async () => {
    try {
      // const authcredetilas = await GetAwsAuthCredetial(getDomainName())

      const response = await fetch(
        // Get the initial thread ID from openai -> eg-dev-ai-openai-simple/get-thread-id-from-openai
        'https://efrn17ga06.execute-api.us-east-2.amazonaws.com/dev/threads',
        { method: 'GET', headers: { 'Content-Type': 'application/json', 'Assistant-Id': assistant, 'Company-Id': localStorage.getItem('companyId'), 'Site-Id': localStorage.getItem('siteId') } }
      )
      // const response = await fetch(
      //   // Get the initial thread ID from openai -> eg-dev-ai-openai-simple/get-thread-id-from-openai
      //   'https://d8tccbgmu0.execute-api.us-west-2.amazonaws.com/dev/get-thread-id-from-openai'
      // )
      if (!response.ok) {
        throw new Error('Failed to get thread ID')
      }

      const data = await response.json()
      const parsedData = JSON.parse(data.body)
      const initialThreadId = parsedData.thread_id
      setThreadId(initialThreadId)
      console.log('Initial Thread ID:', initialThreadId)
      return initialThreadId
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const sendMessageToWebSocket = message => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      // Store the message to send it later when the connection is open
      pendingMessages.current.push(message)
    } else {
      console.error('WebSocket is not connected or in an invalid state')
    }
  }

  const handleClick = async () => {
    if (!message.trim()) return

    setIsLoading(true)

    let currentThreadId = threadId

    if (currentThreadId === '') {
      currentThreadId = await getInitialThreadId()
    }

    try {
      let websocketPayload

      if (assistant == 'asst_7rSTGruffETF103ClqTJfqVr' && chatHistory.length === 0) {
        // asset management assistant

        const attachments = s3Contents[selectedProject.id]
          ? s3Contents[selectedProject.id].map(file => {
              const key = file.Key
              const ext = key.substring(key.lastIndexOf('.') + 1)
              const name = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
              return { key, ext, name }
            })
          : []

        websocketPayload = {
          body: {
            action: 'sendUserMessage',
            text_content: message,
            attachments: attachments,
            role: 'user',
            event: 'user.message.with.attachments',
            assistant_id: assistant,
            thread_id: currentThreadId,
            project_id: selectedProject.id,
          },
        }
      } else {
        // base case
        websocketPayload = {
          body: {
            action: 'sendUserMessage',
            text_content: message,
            attachments: [],
            role: 'user',
            event: 'user.message',
            assistant_id: assistant,
            thread_id: currentThreadId,
            project_id: selectedProject.id,
          },
        }
      }

      console.log(websocketPayload.body)
      // Send the message to the WebSocket server if the connection is open
      sendMessageToWebSocket(websocketPayload.body)

      addMessageToHistory({ sender: 'user', text: message })

      // this will need to be replaced by a system event from the websocket
      // addMessageToHistory({ sender: "system", text: latestSystemMessage });

      setIsWaitingForResponse(true)
      setIsResponding(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setMessage('')
      clearLatestSystemMessage()
      setIsLoading(false)
    }
  }

  const handleAssistantChange = newAssistant => {
    setNewAssistant(newAssistant)
    setModalAction('changeAssistant')
    setShowModal(true)
  }

  const handleClearChat = () => {
    setModalAction('clearChat')
    setShowModal(true)
  }

  const confirmAction = () => {
    if (modalAction === 'changeAssistant') {
      setAssistant(newAssistant)
      setPlaceholder(getInitialPlaceholder(newAssistant))
    } else if (modalAction === 'clearChat') {
      clearChat()
      setPlaceholder(getInitialPlaceholder(assistant))
    }
    setShowModal(false)
  }

  const cancelAction = () => {
    setNewAssistant('')
    setShowModal(false)
  }

  // Function to get initial placeholder based on the assistant
  function getInitialPlaceholder(assistant) {
    if (assistant === 'asst_6drFnIFh3PJy1GVSCcmoRndA') {
      return 'Start a conversation about your facility...'
    } else if (assistant === 'asst_dzXEpcoCsoIFeF2tV44pK4Ch') {
      return 'Start a conversation about uploading your SKM data...'
    } else {
      return 'Type your message...'
    }
  }

  // Chat Websocket manager:
  useEffect(() => {
    if (!threadId || threadId === 'new_thread_id') {
      return
    }

    const socket = new WebSocket(
      // establish connection to the eg-ai-dev-chat WebSocket api $connect route
      `wss://bvm6rb2ia2.execute-api.us-west-2.amazonaws.com/dev/?threadId=${threadId}`
    )

    socket.onopen = () => {
      console.log('Chat WebSocket connected for threadId: ', threadId)
      setChatWebSocketConnection(true)
      // Send any pending messages that were queued while connecting
      while (pendingMessages.current.length > 0) {
        const pendingMessage = pendingMessages.current.shift()
        socket.send(JSON.stringify(pendingMessage))
      }
    }

    socket.onclose = event => {
      console.log('Chat WebSocket disconnected')
    }

    socket.onerror = error => {
      console.error('Chat WebSocket error: ', error)
    }

    socket.onmessage = event => {
      console.log('Message from Chat Websocket server: ', event.data)
      // deal with the incoming message, add it to chat history etc.
      let message = JSON.parse(event.data)
      let type = message.type
      let role = message.role
      let text_content = message.text_content

      // this is for replacing the dynamic system message with an immutable one
      if (type === 'full_response') {
        //console.log(event.data);
        addMessageToHistory({ sender: 'system-immutable', text: text_content })
        setIsWaitingForResponse(false)
        setIsResponding(false)
      } else if (type === 'tool_call_initiated') {
        //console.log(event.data);
        addMessageToHistory({
          sender: 'system-immutable',
          text: 'Tool call initiated...',
        })
        setIsWaitingForResponse(false)
        setIsResponding(false)
      }
    }

    wsRef.current = socket

    // Cleanup function to close the WebSocket connection when the component unmounts or threadId changes
    return () => {
      console.log('Cleaning up Chat WebSocket connection')
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [threadId, setLatestSystemMessage, replaceLatestMessageWithImmutable, setIsLoading, clearLatestSystemMessage, setIsWaitingForResponse, setChatWebSocketConnection, setIsResponding, addMessageToHistory, getLatestSystemMessage, getLatestMessageRole, getLatestMessageContent])

  // CURRENTLY NOT WORKING

  // S3 Websocket manager:
  useEffect(() => {
    if (!threadId) {
      return
    }

    const s3Socket = new WebSocket(`wss://2b3dnl4rt3.execute-api.us-west-2.amazonaws.com/dev/?threadId=${threadId}&projectId=${selectedProject.id}`)

    s3Socket.onopen = () => {
      console.log('S3 WebSocket connected for threadId: ', threadId)
      setS3WebSocketConnection(true)
    }

    s3Socket.onclose = event => {
      console.log('S3 WebSocket disconnected')
    }

    s3Socket.onerror = error => {
      console.error('S3 WebSocket error: ', error)
    }

    s3Socket.onmessage = event => {
      console.log('Message from S3 server: ', event.data)
      fetchS3Contents(threadId)
    }

    s3wsRef.current = s3Socket

    // Cleanup function to close the WebSocket connection when the component unmounts or threadId changes
    return () => {
      console.log('Cleaning up S3 WebSocket connection')
      if (s3wsRef.current) {
        s3wsRef.current.close()
      }
    }
  }, [threadId, setS3WebSocketConnection, fetchS3Contents, selectedProject.id])

  return (
    <Container
      className='chat-container'
      maxWidth='md'
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '16px',
        marginBottom: '16px',
        maxHeight: '90%',
      }}
    >
      <Box className='assistant-selector' sx={{ m: 2 }}>
        <Assistant assistant={assistant} handleAssistantChange={handleAssistantChange} placeholder={placeholder} selectedProject={selectedProject} />
      </Box>
      <MessageContainerV2 chatHistory={chatHistory} isWaitingForResponse={isWaitingForResponse} messageEndRef={messageEndRef} />
      <MessageInput message={message} handleInputChange={handleInputChange} handleClick={handleClick} isLoading={isLoading} placeholder={placeholder} assistant={assistant} threadId={threadId} selectedProject={selectedProject} isWaitingForResponse={isWaitingForResponse} isResponding={isResponding} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          m: 2,
        }}
      >
        {isLoading && <Spinner />}
        {threadId && <ChatThread threadId={threadId} />}
        <Box flex={1} />
        <IconButton color='secondary' onClick={handleClearChat} aria-label='delete'>
          <DeleteIcon />
        </IconButton>
      </Box>
      <Modal show={showModal} onClose={cancelAction} onConfirm={confirmAction}>
        Are you sure? Progress will be lost.
      </Modal>
    </Container>
  )
}

export default ChatContainer
