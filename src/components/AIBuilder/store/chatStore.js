import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

// Initialize AWS S3
const s3Client = new S3Client({
  region: process.env.REACT_APP_VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_VITE_AWS_SECRET_ACCESS_KEY,
  },
})

const useChatStore = create(
  devtools(
    persist(
      set => ({
        message: '',
        chatHistory: [],
        threadId: '',
        isLoading: false,
        isPolling: false,
        assistant: 'asst_6drFnIFh3PJy1GVSCcmoRndA',
        showModal: false,
        newAssistant: '',
        s3Contents: {},
        selectedFile: null,
        progressiveMsg: '',
        setMessage: message => set({ message }),
        setProgressiveMsg: progressiveMsg =>
          set(state => ({
            progressiveMsg: state.progressiveMsg + progressiveMsg,
          })),
        addMessageToHistory: message => set(state => ({ chatHistory: [...state.chatHistory, message] })),
        setThreadId: threadId => set({ threadId }),
        setIsLoading: isLoading => set({ isLoading }),
        setIsPolling: isPolling => set({ isPolling }),
        clearChat: () =>
          set({
            chatHistory: [],
            threadId: '',
            s3Contents: {},
            newAssistant: '',
            isPolling: false,
          }),
        setAssistant: assistant => set({ assistant }),
        setShowModal: showModal => set({ showModal }),
        setNewAssistant: newAssistant => set({ newAssistant }),
        setSelectedFile: file => set({ selectedFile: file }),
        fetchS3Contents: async threadId => {
          try {
            const command = new ListObjectsV2Command({
              Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
              Prefix: `sessions/${threadId}/`,
            })
            const data = await s3Client.send(command)
            set(state => ({
              s3Contents: { ...state.s3Contents, [threadId]: data.Contents },
            }))
          } catch (error) {
            console.error('Error fetching S3 contents:', error)
          }
        },
      }),
      {
        name: 'chat-store-v1',
        partialize: state => ({
          message: state.message,
          chatHistory: state.chatHistory,
          threadId: state.threadId,
        }),
      }
    ),
    { name: 'chat-store-v1' } // Specify the name for the devtools instance
  )
)

export default useChatStore
