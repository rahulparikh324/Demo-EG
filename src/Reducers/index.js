import { combineReducers } from 'redux'
import loginReducer from './loginReducer'
import assetListReducer from './Asset/assetListReducer'
import inspectionListReducer from './Inspection/inspectiontListReducer'
import inspectionFilterStateReducer from './Inspection/inspectionFilterStateReducer'
import dashboardListReducer from './Dashboard/dashboardReducer'
import uploadAssetReducer from './Asset/uploadAssetReducer'
import workOrderListReducer from './WorkOrder/workOrderListReducer'
import workOrderDetailReducer from './WorkOrder/workOrderDetailReducer'
import workOrderCreateReducer from './WorkOrder/workOrderCreateReducer'
import workOrderUpdateReducer from './WorkOrder/workOrderUpdateReducer'
import workOrderFilterStateReducer from './WorkOrder/workOrderFilterStateReducer'
import generateBarcodeReducer from './Asset/generateBarcodeReducer'
import assetDetailReducer from './Asset/assetDetailReducer'
import ValidateAssetIdReducer from './Asset/validateAssetIdReducer'
import assetInspectionListReducer from './Asset/assetInspectionListReducer'
import assetWorkOrderListReducer from './Asset/assetWorkOrderListReducer'
import assetFilterStateReducer from './Asset/assetFilterStateReducer'
import userReducer from './User/userReducer'
import getAllCompanyReducer from './User/getAllCompanyReducer'
import getUserRolesReducer from './User/getUserRolesReducer'
import userDetailReducer from './User/userDetailReducer'
import userFilterStateReducer from './User/userFilterStateReducer'
import notificationListReducer from './notificationListReducer'
import generateBarcodeUserReducer from './User/generateBarcodeUserReducer'
import profileReducer from './profileReducer'
import reportsReducer from './Reports/reportReducer'
import logoutReducer from './logoutReducer'
import helperReducer from './helperReducer'

const rootReducer = combineReducers({
  loginReducer,
  assetListReducer,
  inspectionListReducer,
  inspectionFilterStateReducer,
  workOrderFilterStateReducer,
  dashboardListReducer,
  uploadAssetReducer,
  workOrderListReducer,
  workOrderDetailReducer,
  workOrderCreateReducer,
  workOrderUpdateReducer,
  generateBarcodeReducer,
  assetDetailReducer,
  ValidateAssetIdReducer,
  assetInspectionListReducer,
  assetWorkOrderListReducer,
  userReducer,
  getAllCompanyReducer,
  getUserRolesReducer,
  userDetailReducer,
  notificationListReducer,
  generateBarcodeUserReducer,
  profileReducer,
  reportsReducer,
  assetFilterStateReducer,
  logoutReducer,
  userFilterStateReducer,
  helperReducer,
})

export default rootReducer
