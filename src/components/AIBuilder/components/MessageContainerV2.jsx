import React, { useRef, useEffect } from 'react'
import { Box } from '@material-ui/core'
import Message from './Message'
import SystemMessage from './SystemMessage'
import useChatStoreV2 from '../store/chatStoreV2'

const MessageContainerV2 = ({ chatHistory, isWaitingForResponse }) => {
  const latestSystemMessage = useChatStoreV2(state => state.latestSystemMessage)
  const chatHeight = useChatStoreV2(state => state.chatHeight)
  const setChatHeight = useChatStoreV2(state => state.setChatHeight)
  const boxRef = useRef(null)
  const innerBoxRef = useRef(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const newHeight = entry.contentRect.height
        setChatHeight(newHeight) // Update chatHeight in your store
      }
    })

    const currentInnerBoxRef = innerBoxRef.current

    if (currentInnerBoxRef) {
      resizeObserver.observe(currentInnerBoxRef)
    }

    return () => {
      if (currentInnerBoxRef) {
        resizeObserver.unobserve(currentInnerBoxRef)
      }
    }
  }, [setChatHeight])

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [chatHeight]) // Trigger scroll on chat height change

  return (
    <Box
      id={'chat-viewport'}
      ref={boxRef}
      sx={{
        height: '75%',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box ref={innerBoxRef} sx={{ flexGrow: 1 }}>
        {chatHistory.map((chat, index) => {
          if (chat.sender === 'system') {
            return (
              <SystemMessage
                key={index + 1}
                sender={chat.sender}
                text={latestSystemMessage}
                isWaitingForResponse={isWaitingForResponse}
                // isFunctionCalling={isFunctionCalling} // will take this on another day
              />
            )
          } else if (chat.sender === 'system-immutable') {
            return <SystemMessage key={index + 1} sender={chat.sender} text={chat.text} />
          } else {
            return <Message key={index + 1} sender={chat.sender} text={chat.text} />
          }
        })}
        {isWaitingForResponse && <SystemMessage sender={'system-immutable'} text={''} key={0} isWaitingForResponse={isWaitingForResponse} />}
      </Box>
    </Box>
  )
}

export default MessageContainerV2
