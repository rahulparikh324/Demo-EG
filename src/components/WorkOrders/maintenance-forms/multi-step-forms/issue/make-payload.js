import enums from 'Constants/enums'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import { get, isEmpty } from 'lodash'

export const makePayload = ({ issueDetails = {}, assetDetails = {}, woId = '', status }) => {
  const isRepair = get(issueDetails, 'resolutionType.value', 0) === enums.MWO_INSPECTION_TYPES.REPAIR
  const isReplace = get(issueDetails, 'resolutionType.value', 0) === enums.MWO_INSPECTION_TYPES.REPLACE
  const isGeneral = get(issueDetails, 'resolutionType.value', 0) === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK
  const showSolution = (isRepair || isReplace) && (get(issueDetails, 'repairResolution.value', '') || get(issueDetails, 'replacementResolution.value', '')) !== 2
  const showFurtherDetails = (isRepair || isReplace) && (get(issueDetails, 'repairResolution.value', '') || get(issueDetails, 'replacementResolution.value', '')) === 2
  const isUuidValid = id => (isEmpty(id) ? null : [...new Set([...id.split('').filter(d => d !== '-')])].length !== 1)
  const payload = {}
  const detailsOfIssue = {
    issueType: get(issueDetails, 'issueType.value', null),
    inspectionType: get(issueDetails, 'resolutionType.value', null),
    assetIssueId: issueDetails.isAnExistingIssue ? issueDetails.assetIssueId : null,
    selectedAssetId: get(issueDetails, 'asset.linkedAsset.value', '') === 'TEMP-ID' ? null : get(issueDetails, 'asset.linkedAsset.value', null),
    isSelectedAssetIdMain: isEmpty(get(issueDetails, 'asset.linkedAsset', {})) ? false : !get(issueDetails, 'asset.linkedAsset.isTemp', false),
    issueCreationType: issueDetails.isAnExistingIssue ? 1 : 2,
    newIssueAssetType: get(issueDetails, 'asset.isVerifyInField', false) ? 3 : get(issueDetails, 'asset.type', '') === 'ADD_EXISTING' ? 2 : 1,
    issueTitle: issueDetails.issueTitle,
    problemDescription: get(issueDetails, 'issueDescription', ''),
    priority: issueDetails.priority,
    woId,
    resolutionDescription: showSolution ? get(issueDetails, 'solutionDescription', null) : null,
    inspectionFurtherDescription: showFurtherDetails ? get(issueDetails, 'inspectionFurtherDetails', null) : null,
    resolutionType: isRepair ? get(issueDetails, 'repairResolution.value', null) : isReplace ? get(issueDetails, 'replacementResolution.value', null) : isGeneral ? get(issueDetails, 'issueResolution.value', null) : null,
    replacedAssetId: get(issueDetails, 'replacedByAsset.value', null),
    isReplacedAssetIdIsMain: get(issueDetails, 'replacedByAsset.isTemp', false) === false ? true : false,
    issueWolineStatus: status,
    issueImages: get(issueDetails, 'issueImageList', []),
    woLineIssueId: get(issueDetails, 'woLineIssueId', null),
  }
  payload.issueDetails = detailsOfIssue
  payload.installWolineDetails = {
    ...assetDetails,
    woId,
    siteId: getApplicationStorageItem('siteId'),
    woonboardingassetsId: isUuidValid(get(assetDetails, 'woonboardingassetsId', '')) ? get(assetDetails, 'woonboardingassetsId', null) : null,
    assetImageList:
      get(issueDetails, 'asset.type', '') === 'CREATE_NEW'
        ? get(assetDetails, 'assetImageList', [])
        : get(assetDetails, 'assetImageList', []).some(e => e.assetPhoto.includes('/'))
        ? get(assetDetails, 'assetImageList', []).map(d => ({ ...d, assetPhoto: d.assetPhoto.includes('/') ? d.assetPhoto.split('/')[5] : d.assetPhoto }))
        : get(assetDetails, 'assetImageList', []),
  }
  if (get(issueDetails, 'isEdit', null) != null) {
    payload.issue_woline_details = {
      woonboardingassetsId: isUuidValid(get(issueDetails, 'woOBAssetID', null)) ? get(issueDetails, 'woOBAssetID', null) : null,
      status,
    }
  } else {
    //In add issue if further details visible then pass to below key said by BE
    payload.issueDetails.inspectionFurtherDetails = showFurtherDetails ? get(issueDetails, 'inspectionFurtherDetails', null) : null
  }
  return payload
}
