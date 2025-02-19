// src/hooks/usePolling.js
import { useEffect, useRef, useCallback } from 'react'
import { useStore } from 'zustand'
import chatStore from '../store/chatStore'

const usePolling = (shouldPoll, jobUUID, interval = 5000) => {
  const intervalId = useRef(null)
  const { addMessageToHistory, setThreadId, setIsPolling } = useStore(chatStore)

  const pollForCompletion = useCallback(async () => {
    const statusUrl = `https://ul9ucb3orc.execute-api.us-west-2.amazonaws.com/test/status?job_uuid=${jobUUID}`
    try {
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Polling data:', data)

      if (data.status === 'completed') {
        addMessageToHistory({ sender: 'system', text: data.ai_response })
        if (data.thread_id) {
          setThreadId(data.thread_id)
        }
        clearInterval(intervalId.current)
        setIsPolling(false)
      }
    } catch (error) {
      console.error('Error while polling:', error)
      clearInterval(intervalId.current)
      setIsPolling(false)
    }
  }, [jobUUID, addMessageToHistory, setThreadId, setIsPolling])

  useEffect(() => {
    if (shouldPoll && jobUUID) {
      intervalId.current = setInterval(pollForCompletion, interval)
    }

    return () => clearInterval(intervalId.current)
  }, [shouldPoll, jobUUID, pollForCompletion, interval])

  return null
}

export default usePolling
