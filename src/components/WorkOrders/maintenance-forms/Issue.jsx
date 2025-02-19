import React, { useState } from 'react'

import ExistingIssues from 'components/Issues/work-order/existing-issues'
import AddIssueLine from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue'

import IssueProvider from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/provider'

const Issue = ({ open, onClose, workOrderID, classCodeOptions = [], afterSubmit }) => {
  const steps = { one: 'ONE', default: 'ADD_EXISTING' }
  // const [step, setStep] = useState(steps.default)
  const [isAddIssueLineDrawerOpen, setIsAddIssueLineDrawerOpen] = useState(false)

  const closeAddIssueLine = () => {
    setIsAddIssueLineDrawerOpen(false)
  }

  const handleAfterSubmit = () => {
    onClose()
    afterSubmit()
  }

  return (
    <IssueProvider>
      <ExistingIssues
        createNew={() => {
          setIsAddIssueLineDrawerOpen(true)
        }}
        refetchData={handleAfterSubmit}
        open={open}
        onClose={onClose}
        workOrderID={workOrderID}
      />
      {isAddIssueLineDrawerOpen && <AddIssueLine afterSubmit={handleAfterSubmit} open={isAddIssueLineDrawerOpen} onClose={closeAddIssueLine} workOrderID={workOrderID} classCodeOptions={classCodeOptions} />}
    </IssueProvider>
  )
}

export default Issue
