import { createContext } from 'react'

const issueContext = createContext({
  issueDetails: {},
  updateIssueDetails: () => {},
})
export default issueContext
