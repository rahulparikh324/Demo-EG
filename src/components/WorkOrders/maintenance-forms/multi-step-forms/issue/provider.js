import React, { useState } from 'react'
import IssueContext from './context'

import { assetTypeOfIssue } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'
import { priorityOptions } from 'components/Issues/utlis.js'

const IssueProvider = ({ children }) => {
  const [data, setData] = useState({
    issueDetails: { asset: { type: assetTypeOfIssue[0].value }, priority: priorityOptions[0].value },
    assetDetails: {},
    other: {},
  })
  const updateIssueDetails = (key, value) => {
    setData(p => ({ ...p, [key]: value }))
  }
  return <IssueContext.Provider value={{ data, updateIssueDetails }}>{children}</IssueContext.Provider>
}

export default IssueProvider
