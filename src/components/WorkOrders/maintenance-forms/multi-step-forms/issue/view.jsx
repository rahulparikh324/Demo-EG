import React, { useState, useContext } from 'react'
import Drawer from '@material-ui/core/Drawer'
import Stepper from 'components/WorkOrders/maintenance-forms/multi-step-forms/common/stepper'
import { FormTitle } from 'components/Maintainance/components'
import { NEW_ISSUE_ASSET_TYPE, issueSteps } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'
import { get } from 'lodash'
import ViewIssueDetails from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/view-issue-details'
import ViewAssetDetails from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/view-asset-details'
import ViewResolutionDetail from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/view-resolution-details'
import useFetchData from 'hooks/fetch-data'
import workorder from 'Services/WorkOrder/common'

const ViewIssue = ({ open, onClose, woOBAssetID, obj = {}, isAssetDetails, onEdit, isEdit }) => {
  const [activeStep, setActiveStep] = useState(issueSteps[0])
  const { data } = useFetchData({ fetch: workorder.getIssueWOlineDetailsById, payload: woOBAssetID, formatter: d => get(d, 'data', {}), externalLoader: true })
  const isVerifyInField = get(data, 'issueDetails.newIssueAssetType', 0) === NEW_ISSUE_ASSET_TYPE.VERIFY_ON_FIELD ? true : false
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='View Issue' onEdit={onEdit} isEdit={isEdit} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ height: `calc(100vh - ${isVerifyInField ? '64' : '126'}px)`, background: '#efefef', width: '80vw' }}>
        {!isVerifyInField && (
          <div style={{ padding: '14px' }}>
            <Stepper steps={issueSteps} activeStep={activeStep} />
          </div>
        )}
        {activeStep.id === issueSteps[0].id && <ViewIssueDetails detailObj={data} onClose={onClose} onNext={() => setActiveStep(issueSteps[1])} isAssetDetails />}
        {activeStep.id === issueSteps[1].id && <ViewAssetDetails installWoLineDetailObj={get(data, 'installWolineDetails', null)} onClose={onClose} onNext={() => setActiveStep(issueSteps[2])} onPrevious={() => setActiveStep(issueSteps[0])} isOnboarding />}
        {activeStep.id === issueSteps[2].id && <ViewResolutionDetail detailObj={data} onClose={onClose} onPrevious={() => setActiveStep(issueSteps[1])} />}
      </div>
    </Drawer>
  )
}

export default ViewIssue
