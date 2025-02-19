import React, { useState, useContext, useEffect } from 'react'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import Stepper from 'components/WorkOrders/maintenance-forms/multi-step-forms/common/stepper'
import IssueDetails from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/issue-details'
import InstallAssetForMaintenance from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/asset-details'
import ResolutionDetails from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/resolution-details'
import { NEW_ISSUE_ASSET_TYPE, issueSteps, resolutionTypes } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'
import issueContext from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/context'
import { get, isEmpty } from 'lodash'
import workorder from 'Services/WorkOrder/common'
import $ from 'jquery'
import { typeOptions } from 'components/Issues/utlis'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { camelizeKeys } from 'helpers/formatters'
import enums from 'Constants/enums'
import { issueResolutionOptions, repairResolutionOptions, replacementResolutionOptions } from 'components/WorkOrders/maintenance-forms/utils'

const AddIssueLine = ({ open, onClose, workOrderID, classCodeOptions, afterSubmit, obj = {}, woOBAssetID, isQuote }) => {
  const [activeStep, setActiveStep] = useState(issueSteps[0])
  const { data, updateIssueDetails } = useContext(issueContext)
  const [openDrawer, setOpenDrawer] = useState(false)
  const isVerifyInField = get(data, 'issueDetails.asset.isVerifyInField', false)

  useEffect(() => {
    if (!isEmpty(woOBAssetID)) {
      const fetchData = async () => {
        try {
          $('#pageLoading').show()
          const result = await onBoardingWorkorder.getAssetDetail({ id: woOBAssetID })
          if (result.success === 1 && !isEmpty(result.data)) {
            const response_data = camelizeKeys(result.data)
            // console.log(response_data)

            if (!isEmpty(response_data.linkedIssues) && (!isEmpty(get(response_data, 'linkedIssues.mainIssueList', [])) || !isEmpty(get(response_data, 'linkedIssues.tempIssueList', [])))) {
              let issueDetails = null
              const linkedMainIssues = get(response_data, 'linkedIssues.mainIssueList', []) || []
              if (isEmpty(linkedMainIssues)) {
                const linkedTempIssues = get(response_data, 'linkedIssues.tempIssueList', []) || []
                issueDetails = !isEmpty(linkedTempIssues) ? linkedTempIssues[0] : null
              } else {
                issueDetails = linkedMainIssues[0]
              }
              const isVerifyInField = get(response_data, 'newIssueAssetType', 0) === NEW_ISSUE_ASSET_TYPE.VERIFY_ON_FIELD ? true : false
              const isTempAsset = isEmpty(get(response_data, 'assetId', null)) && !isEmpty(get(response_data, 'issuesTempAssetId', null)) ? true : false
              const asset = {
                type: 'ADD_EXISTING',
                linkedAsset: {
                  value: !isTempAsset ? get(response_data, 'assetId', null) : get(response_data, 'issuesTempAssetId', null),
                  label: get(response_data, 'assetName'),
                  assetName: get(response_data, 'assetName'),
                },
                isVerifyInField: isVerifyInField,
              }
              if (isTempAsset) {
                asset.linkedAsset.woonboardingassetsId = get(response_data, 'issuesTempAssetId', null)
                asset.linkedAsset.isTemp = true
              } else {
                asset.linkedAsset.assetId = get(response_data, 'assetId', null)
              }
              const woLineIssueDetail = {
                assetIssueId: get(issueDetails, 'assetIssueId', null),
                issueTitle: get(response_data, 'issueTitle', ''),
                assetId: get(response_data, 'assetId', null),
                assetName: get(response_data, 'assetName', ''),
                issueDescription: get(response_data, 'problemDescription', ''),
                priority: get(response_data, 'issuePriority', 0),
                asset,
                isAnExistingIssue: !isEmpty(linkedMainIssues) ? true : false,
                issueType: typeOptions.find(e => e.value === get(issueDetails, 'issueType', 0)),
                issueImageList: get(response_data, 'assetImageList', []).map(e => ({ ...e, imageFileName: e.woonboardingassetsimagesmappingId, imageThumbnailFileName: !isEmpty(e.assetThumbnailPhoto) ? e.assetThumbnailPhoto.split('/')[5] : null, imageThumbnailFileNameUrl: e.assetThumbnailPhoto, imageFileNameUrl: e.assetPhoto })),
                resolutionType: resolutionTypes.find(e => e.value === get(response_data, 'inspectionType', 0)),
                replacedAssetId: get(response_data, 'replacedAssetId', null),
                repairResolution: repairResolutionOptions.find(e => e.value === get(response_data, 'repairResolution', 0)),
                replacementResolution: replacementResolutionOptions.find(e => e.value === get(response_data, 'replacementResolution', 0)),
                issueResolution: issueResolutionOptions.find(e => e.value === get(response_data, 'generalIssueResolution', 0)),
                solutionDescription: get(response_data, 'solutionDescription', ''),
                inspectionFurtherDetails: get(response_data, 'inspectionFurtherDetails', ''),
                isEdit: true,
                woLineIssueId: get(issueDetails, 'woLineIssueId', null),
                woOBAssetID: get(response_data, 'woonboardingassetsId', null),
              }
              updateIssueDetails('issueDetails', woLineIssueDetail)
            }
          }
          $('#pageLoading').hide()
        } catch (error) {
          console.error('Error fetching data:', error)
          $('#pageLoading').hide()
        }
      }
      fetchData()
    }
  }, [woOBAssetID])

  const handleDataFromChildOpen = data => {
    setOpenDrawer(data)
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={!isEmpty(woOBAssetID) ? 'Edit Issue' : 'Add Issue'} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ height: `calc(100vh - ${isVerifyInField ? '64' : '126'}px)`, background: '#efefef', width: openDrawer ? '100vw' : '80vw' }}>
        {!isVerifyInField && (
          <div style={{ padding: '14px' }}>
            <Stepper steps={issueSteps} activeStep={activeStep} />
          </div>
        )}
        {activeStep.id === issueSteps[0].id && <IssueDetails afterSubmit={afterSubmit} workOrderID={workOrderID} onClose={onClose} onNext={() => setActiveStep(issueSteps[1])} />}
        {activeStep.id === issueSteps[1].id && (
          <InstallAssetForMaintenance onPrevious={() => setActiveStep(issueSteps[0])} onNext={() => setActiveStep(issueSteps[2])} classCodeOptions={classCodeOptions} isOnboarding isInstalling viewObj={get(data, 'other', {})} open={true} onClose={onClose} workOrderID={workOrderID} parentDrawer={handleDataFromChildOpen} />
        )}
        {activeStep.id === issueSteps[2].id && <ResolutionDetails afterSubmit={afterSubmit} onPrevious={() => setActiveStep(issueSteps[1])} onClose={onClose} workOrderID={workOrderID} classCodeOptions={classCodeOptions} isQuote={isQuote} />}
      </div>
    </Drawer>
  )
}

export default AddIssueLine
