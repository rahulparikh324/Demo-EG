import userConstants from '../../Constants/userConstants'

const updateAssetFilterState = state => ({ type: userConstants.UPDATE_ASSET_FILTER_STATE, payload: state })

export default function assetFilterStateAction(state) {
  return dispatch => dispatch(updateAssetFilterState(state))
}
