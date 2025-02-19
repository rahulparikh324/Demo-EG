import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

const useChatStoreV2 = create(
  devtools(
    persist(
      (set, get) => ({
        chatWebSocketConnection: false,
        s3WebSocketConnection: false,
        message: '',
        latestSystemMessage: '',
        chatHistory: [],
        threadId: '',
        selectedProject: {
          id: '12345',
          name: 'Test Project',
        },
        isLoading: false,
        isPolling: false,
        isWaitingForResponse: false,
        isResponding: false,
        assistant: 'asst_3ZPqjgfsdHNLB0i7tjJ5W6yB',
        showModal: false,
        newAssistant: '',
        s3Contents: {},
        selectedFile: null,
        chatHeight: 0,
        projects: [],
        setChatHeight: height => set({ chatHeight: height }),
        setSelectedProject: project => set({ selectedProject: project }),
        setMessage: message => set({ message }),
        setLatestSystemMessage: newMessage =>
          set(state => ({
            latestSystemMessage: state.latestSystemMessage + newMessage,
          })),
        addMessageToHistory: message => set(state => ({ chatHistory: [...state.chatHistory, message] })),
        replaceLatestMessageWithImmutable: newMessage =>
          set(state => {
            const newChatHistory = [...state.chatHistory.slice(0, -1), newMessage]
            return { chatHistory: newChatHistory }
          }),
        getLatestMessageContent: () => {
          const latestMessage = useChatStoreV2.getState().chatHistory.slice(-1)[0]
          return latestMessage ? latestMessage.text : ''
        },
        getLatestMessageRole: () => {
          const latestMessage = useChatStoreV2.getState().chatHistory.slice(-1)[0]
          return latestMessage ? latestMessage.sender : ''
        },
        getLatestSystemMessage: () => useChatStoreV2.getState().latestSystemMessage,
        clearLatestSystemMessage: () => set({ latestSystemMessage: '' }),
        setThreadId: threadId => set({ threadId }),
        setIsLoading: isLoading => set({ isLoading }),
        setIsPolling: isPolling => set({ isPolling }),
        setIsWaitingForResponse: isWaitingForResponse => set({ isWaitingForResponse }),
        setIsResponding: isResponding => set({ isResponding }),
        clearChat: () =>
          set({
            chatHistory: [],
            threadId: '',
            newAssistant: '',
            isPolling: false,
            isLoading: false,
            latestSystemMessage: '',
            isWaitingForResponse: false,
            isResponding: false,
            s3WebSocketConnection: false,
            chatWebSocketConnection: false,
          }),
        setAssistant: assistant => set({ assistant }),
        setShowModal: showModal => set({ showModal }),
        setNewAssistant: newAssistant => set({ newAssistant }),
        setSelectedFile: file => set({ selectedFile: file }),
        fetchProjects: async username => {
          console.log('Fetching projects for username:', username)
          try {
            const response = await fetch(`https://i8pc5k8px0.execute-api.us-west-2.amazonaws.com/dev/projects?username=${username}`)
            if (!response.ok) {
              set({ projects: [] })
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            console.log('Fetched projects from POSTGRES:', data)
            set({ projects: data.projects })
            return data.projects
          } catch (error) {
            console.error('Failed to fetch projects', error)
            set({ projects: [] })
          }
        },
        setS3WebSocketConnection: connection => {
          set({ chatWebSocketConnection: connection })
        },
        setChatWebSocketConnection: connection => {
          set({ s3WebSocketConnection: connection })
        },
      }),
      {
        name: 'chat-store-v2',
        partialize: state => ({
          message: state.message,
          chatHistory: state.chatHistory,
          threadId: state.threadId,
        }),
      }
    ),
    { name: 'chat-store-v2' } // Specify the name for the devtools instance
  )
)

export default useChatStoreV2
