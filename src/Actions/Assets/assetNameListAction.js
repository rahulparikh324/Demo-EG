import getAllAssetIdList from '../../Services/Reports/getAllAssetIdListService'
import userConstants from '../../Constants/userConstants'

const { ASSET_NAME_LIST_REQUEST, ASSET_NAME_LIST_SUCCESS, ASSET_NAME_LIST_FAILURE } = userConstants

export default function assetNameListAction(urlParameters) {
  const request = assetList => ({ type: ASSET_NAME_LIST_REQUEST, assetList })
  const success = assetList => ({ type: ASSET_NAME_LIST_SUCCESS, assetList })
  const failure = error => ({ type: ASSET_NAME_LIST_FAILURE, error })

  return dispatch => {
    dispatch(request({}))
    getAllAssetIdList(urlParameters)
      .then(response => {
        dispatch(success(response.data.data))
      })
      .catch(error => {
        dispatch(failure(error))
      })
  }
}
