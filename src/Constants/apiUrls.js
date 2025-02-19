const URL = {
  // BASE:'http://192.168.1.45/Jarvis/api/',//local
  BASE: 'https://dsap.dev.egalvanic.com/api/', //Dev
  // BASE: 'https://qsap.qa.egalvanic.com/api/', //QA
  // BASE: 'https://psap.egalvanic.com/api/', //Production

  login: 'User/Login',
  getDashboard: 'Inspection/PendingInspectionCheckoutAssetsByManager/',
  getAssets: 'Asset/GetAllAssets',
  getAssetDetails: 'Asset/GetAssetsById',
  uploadAsset: 'Asset/AddAssets',
  getInspections: 'Inspection/GetAllInspections/',
  getInspectionDetails: 'Inspection/GetInspectionById/',
  approveInspection: 'Inspection/ApproveInspection',
  getWorkOrder: 'Issue/GetAllIssues',
  getWorkOrderDetail: 'Issue/GetIssueDetailsById/',
  createWorkOrder: 'Issue/CreateIssue',
  updateWorkOrder: 'Issue/UpdateIssueByManager',
  getAllCompany: 'Company/GetAllCompany',
  getAllCompanyWithSites: 'Company/GetAllCompaniesWithSites',
  featuresFlagByCompany: 'Company/GetAllFeaturesFlagsByCompany',
  updateFlagForCompany: 'Company/UpdateFeatureFlagForCompany',
  generateBarcode: 'Asset/GenerateAssetBarcode',
  validateAssetId: 'Asset/ValidateInternalAssetID/',
  getAssetBySearch: 'Asset/SearchAssets/',
  getInspectionBySearch: 'Inspection/SearchInspection/',
  getWorkOrderBySearch: 'Issue/SearchIssues/',
  searchInspectionByAssetId: 'Inspection/SearchInspectionByAsset/',
  searchWorkOrderByAssetId: 'Issue/SearchIssueByAssetId/',
  getInspectionListByAssetId: 'Inspection/GetInspectionByAssetId/',
  getWorkorderListByAssetId: 'Issue/GetIssueByAssetId/',
  getAllUser: 'User/GetUsers',
  getUserDetailById: 'User/GetUserById/',
  getUserRole: 'User/GetRoles/',
  addUpdateUser: 'User/AddUpdateUser',
  updateUserStatus: 'User/UpdateUserStatus',
  getUserById: 'User/GetUserById/',
  searchInUserList: 'User/SearchUser/',
  logout: 'User/Logout/',
  getNotificationList: 'User/GetNotifications/',
  generateBarcodeUser: 'User/GenerateUserBarcode',
  uploadInspectionForms: 'Inspection/UploadbulkInspection',
  generateReportMonthy: 'Asset/GetAssetInspectionReportMonthly/',
  generateReportWeekly: 'Asset/GetAssetInspectionReportWeekly/',
  generateReportWeekly1: 'Asset/GetAssetReportWeekly/',
  outstandingIssueList: 'Asset/DashboardOutstandingIssues',
  latestHourReadingReport: 'Asset/GetLatestMeterHoursReport/',
  updateMeterHour: 'asset/UpdateMeterHours',
  updateEmailNotification: 'User/TriggerEmailNotificationStatus/',
  getAwsAuthCredetials: 'company/GetUserPoolDetails',
  updateDefaultRole: 'user/DefaultRole',
  updateDefaultSite: 'user/DefaultSite',
  updateActiveRole: 'user/ActiveRole',
  updateActiveSite: 'user/ActiveSite',
  verifyEmail: 'User/VerifyEmailV2',
  resendTempPassword: 'User/ResendTemporaryPassword',
  historyOFInspectionAssetReport: 'Asset/GetAssetInspectionReport',
  GenerateInspectionOfAssetReport: 'Asset/GenerateAssetInspectionReport',
  CheckStatusOFInspectionAssetReport: 'Asset/ReportStatus',
  GetAllAssetIDList: 'Asset/AllAssets/',
  updateAssetStatus: 'Asset/UpdateAssetStatus',
  updateOperatorUsageEmailNotification: 'User/TriggerOperatorUsageEmailNotificationStatus/',
  updateExecutiveEmailNotificationStatus: 'User/UpdateExecutiveEmailNotificationStatus/',
  assetWiseInspections: 'Asset/GenerateAssetInspectionReportToView',
  assetNotes: {
    add: 'Asset/AddUpdateAssetNotes',
    get: 'Asset/GetAssetNotes',
  },
  getCompanyLogos: 'Company/GetCompanyLogos',
  filterDevice: 'Device/FilterDevice',
  getDeviceModels: 'Device/AllDevicesModel',
  getDeviceOS: 'Device/AllDevicesOS',
  getDeviceBrand: 'Device/AllDevicesBrand',
  getDeviceTypes: 'Device/AllDevicesTypes',
  filterAssetNameOptions: 'FilterAssetNameOptions',
  filterAssetModelOptions: 'FilterAssetModelOptions',
  filterAssetSitesOptions: 'FilterAssetSitesOptions',
  filterAssetCompanyOptions: 'FilterAssetCompanyOptions',
  filterAssetModelYearOptions: 'FilterAssetModelYearOptions',
  filterAssetStatusOptions: 'FilterAssetStatusOptions',

  filterInspectionAssetNameOptions: 'FilterInspectionAssetNameOptions',
  filterInspectionStatusOptions: 'FilterInspectionAssetStatusOptions',
  filterInspectionShiftNumberOptions: 'FilterInspectionShiftNumberOptions',
  filterInspectionOperatorsOptions: 'FilterInspectionOperatorsOptions',
  filterInspectionSitesOptions: 'FilterInspectionSitesOptions',
  filterInspectionCompanyOptions: 'FilterInspectionCompanyOptions',
  filterInspectionSupervisorOptions: 'FilterInspectionSupervisorOptions',

  filterDeviceTypeOptions: 'FilterDeviceTypeOptions',
  filterDeviceBrandOptions: 'FilterDeviceBrandOptions',
  filterDeviceModelOptions: 'FilterDeviceModelOptions',
  filterDeviceOSOptions: 'FilterDeviceOSOptions',
  filterDeviceSitesOptions: 'FilterDeviceSitesOptions',
  filterDeviceCompanyOptions: 'FilterDeviceCompanyOptions',

  filterUsersRoleOptions: 'FilterUsersRoleOptions',
  filterUsersSitesOptions: 'FilterUsersSitesOptions',
  filterUsersCompanyOptions: 'FilterUsersCompanyOptions',

  filterIssuesTitleOptions: 'FilterIssuesTitleOptions',
  filterIssuesAssetOptions: 'FilterIssuesAssetOptions',
  filterIssuesSitesOptions: 'FilterIssuesSitesOptions',
  // ISSUES
  issues: {
    getList: 'WorkOrder/GetAllAssetIssues',
    getDetailsById: 'WorkOrder/ViewAssetIssueDetailsById',
    getAllTempIssues: 'WorkOrder/GetAllWOLineTempIssues',
    getAllIssuesByWorkorder: 'WorkOrder/GetAllIssueByWOid',
    addUpdate: 'WorkOrder/AddUpdateAssetIssue',
    addComment: 'WorkOrder/AddUpdateIssueComment',
    getComment: 'WorkOrder/GetAllAssetIssueComments',
    uploadImage: 'WorkOrder/UploadIssueImage',
    updateImageLabel: 'Issue/UpdateIRVisualImageLabel',
    delete: 'WorkOrder/DeleteAssetIssue',
    getLinkedIssues: 'WorkOrder/GetWOLinkedIssue',
    getIssuesToLink: 'WorkOrder/IssueListtoLinkWOline',
    linkIssueToWorkOrder: 'WorkOrder/LinkIssueToWOLine',
    unlinkIssueFromWorkOrder: 'WorkOrder/UnlinkIssueFromWO',
    addIssuesDirectlyToMaintenanceWO: 'WorkOrder/AddIssuesDirectlyToMaintenanceWO',
    linkIssueToWOFromIssueListTab: 'Issue/LinkIssueToWOFromIssueListTab',
    createTempIssue: 'WorkOrder/CreateTempIssue',
    getAssetList: 'WorkOrder/GetAssetListForIssue',
    multiStep: {
      add: 'Issue/AddIssueBySteps',
      view: 'WorkOrder/GetIssueWOlineDetailsById',
      update: 'Issue/UpdateIssueBySteps',
    },
    getListOptimized: 'Issue/GetAllAssetIssuesOptimized',
    getIssuesByWorkorder: 'Issue/GetAllIssueByWOidOptimized',
    downloadSiteIssueReport: 'Issue/GenerateSiteIssuesReport',
  },

  getPMPlansByCategory: 'PMPlans/Get',
  deletePMPlan: 'PMPlans/Delete',
  duplicatePMPlan: 'PMPlans/Duplicate',
  addUpdatePMPlan: 'PMPlans/AddUpdatePMPlan',

  getPMsByPlan: 'PM/Get',
  addUpdatePM: 'PM/AddUpdatePM',
  deletePM: 'PM/Delete',
  movePM: 'PM/MovePM',
  uploadAttachment: 'PM/UploadAttachment',

  getAllTask: 'Task/Get',
  addUpdateTask: 'Task/AddUpdateTask',
  deleteTask: 'Task/Delete',

  getPlanForAsset: 'AssetPM/GetPMByAssetId',
  deleteAssetPM: 'AssetPM/Delete',
  duplicateAssetPM: 'AssetPM/Duplicate',
  markCompleteAssetPM: 'AssetPM/MarkComplete',
  updateTaskStatus: 'AssetPM/UpdateTaskStatus',
  upComingPMs: 'AssetPM/UpComingPMsWeekly',
  dashboardPendingPMItems: 'AssetPM/DashboardPendingPMItems',
  filterPMAssetNames: 'AssetPM/FilterPendingPMItemsAssetIds',
  filterPMPlans: 'AssetPM/FilterPendingPMItemsPMPlans',
  filterPMTitles: 'AssetPM/FilterPendingPMItemsPMItems',
  filterPMSites: 'AssetPM/FilterPendingPMItemsSites',
  GetAssetActivityLogs: 'Asset/GetAssetActivityLogs',

  getAllServiceDealers: 'AssetPM/GetAllServiceDealers',
  addUpdateAsset: 'Asset/AddUpdateAsset',
  getAssetMeterHourHistory: 'AssetPM/GetAssetMeterHourHistory',
  getAllHierarchyAssets: 'Asset/GetAllHierarchyAssets',
  getSubAssetsByAssetID: 'Asset/GetSubAssetsByAssetID',
  getChildrenAssetsByAssetID: 'Asset/GetChildrenByAssetID',
  getAllAssetForTree: 'Asset/GetAllRawHierarchyAssets',
  changeAssetHierarchy: 'Asset/ChangeAssetHierarchy',
  editAssetDetails: 'Asset/EditAssetDetails',
  uploadAssetNameplateImage: 'Asset/UploadAssetNameplateImage',
  getBarcodesIds: 'Asset/GetBarcodesIds',
  getOptionsForBuildingFloorRoomSection: 'Asset/FilterAssetBuildingLocationOptions',
  getAssetHierarchyLevelOptions: 'Asset/FilterAssetHierarchyLevelOptions',
  getAllAssetForCluster: 'Asset/GetAllAssetsForCluster',

  getAssetNotifications: 'PMNotification/GetAssetPMNotification',
  addUpdateAssetPMNotification: 'PMNotification/AddUpdateAssetPMNotification',
  triggerPMItemNotification: 'PMNotification/TriggerPMItemNotification',

  markNotificationAsRead: 'User/UpdateNotificationsStatus',
  markAllNotificationAsRead: 'User/MarkAllNotificationStatus/2',
  getNotificationsCount: 'User/GetNotificationsCount/1',
  TriggerPMNotificationStatus: 'User/TriggerPMNotificationStatus',
  updateExecutivePMDueReportEmailStatus: 'User/UpdateExecutivePMDueReportEmailStatus',
  getPMNotificationConfig: 'PMNotification/GetPMNotification',
  updatePMNotificationConfig: 'PMNotification/AddUpdatePMNotification',
  updatePMNotificationConfig: 'PMNotification/AddUpdatePMNotification',

  addUpdateMaintenanceRequest: 'MaintenanceRequest/AddUpdateMaintenanceRequest',
  getMaintenanceRequestOpenStatusCount: 'MaintenanceRequest/GetMaintenanceRequestOpenStatusCount',
  getAllMaintenanceRequest: 'MaintenanceRequest/GetAllMaintenanceRequest',
  getAllWorkOrderWithNoMR: 'MaintenanceRequest/GetAllWorkOrderWithNoMR',
  resolveMaintenanceRequest: 'MaintenanceRequest/ResolveMaintenanceRequest',
  filterRequestedByOptions: 'MaintenanceRequest/FilterRequestedByOptions',

  addUpdateWorkOrder: 'WorkOrder/AddUpdateWorkOrder',
  getAllWorkOrders: 'WorkOrder/GetAllWorkOrders',
  getAllWorkOrdersNewflow: 'WorkOrder/GetAllWorkOrdersNewflow',
  getAllWorkOrdersOptimized: 'WorkOrder/GetAllWorkOrdersNewflowOptimized',
  getNewIssuesList: 'WorkOrder/GetNewIssuesListByAssetId',
  uploadWorkOrderAttachment: 'WorkOrder/UploadWorkOrderAttachment',
  workOrderStatusHistory: 'WorkOrder/WorkOrderStatusHistory',
  deleteWorkOrder: 'WorkOrder/DeleteWO',
  filterWorkOrderTitleOptions: 'WorkOrder/FilterWorkOrderTitleOptions',
  filterWorkOrderNumberOptions: 'WorkOrder/FilterWorkOrderNumberOptions',
  getWorkOrderDetails: 'WorkOrder/GetWorkOrderById',
  createAcceptanceWO: 'WorkOrder/CreateWorkorderNewflow',
  viewWorkOrderDetailsById: 'WorkOrder/ViewWorkOrderDetailsById',
  getAllTechnician: 'WorkOrder/GetAllTechnician',
  getAllAssetTypes: 'Asset/GetAllAssetTypes',
  getAllInspectionFormByCompanyId: 'InspectionForm/GetAllInspectionFormByCompanyId',
  assignCategoryToWO: 'WorkOrder/AssignCategorytoWO',
  assignAssetToWOCategoryTask: 'WorkOrder/AssignAssettoWOcategoryTask',
  assignTechnicianToWOCategory: 'WorkOrder/AssignTechniciantoWOcategory',
  mapWOAttachmenttoWO: 'WorkOrder/MapWOAttachmenttoWO',
  deleteWOAttachment: 'WorkOrder/DeleteWOAttachment',
  getWOCategoryTaskByCategoryID: 'WorkOrder/GetWOcategoryTaskByCategoryID',
  getFormByWOTaskId: 'WorkOrder/GetFormByWOTaskID',
  updateWOCategoryTaskStatus: 'WorkOrder/UpdateWOCategoryTaskStatus',
  deleteWOCategoryTask: 'WorkOrder/DeleteWOCategoryTask',
  multiCopyWOTask: 'WorkOrder/MultiCopyWOTask',
  deleteWOCategory: 'WorkOrder/DeleteWOCategory',
  updateWOCategoryStatus: 'WorkOrder/UpdateWOCategoryStatus',
  updateWOStatus: 'WorkOrder/UpdateWOStatus',
  getAllWOCategoryTaskByWOId: 'WorkOrder/GetAllWOCategoryTaskByWOId',
  getWOBacklogCardList: 'WorkOrder/GetWOBacklogCardList',
  GetWOBacklogCardListV2: 'WorkOrder/GetWOBacklogCardList_V2',
  getQuoteBacklogCardList: 'WorkOrder/GetQuoteListStatusWise',
  GetQuoteListStatusWiseV2: 'WorkOrder/GetQuoteListStatusWise_V2',
  getWOGridView: 'WorkOrder/GetWOGridView',
  uploadQuote: 'WorkOrder/UploadQuote',
  copyFieldsFromForm: 'WorkOrder/CopyFieldsFromForm',
  exportWorkOrderPDF: 'WorkOrder/WorkOrderDetailsByIdForExportPDF',
  getFormJsonAndData: 'WorkOrder/GetFormJsonForLambda',
  getAssetsToAssign: 'WorkOrder/GetAssetsToAssign',
  getAssetsClassToAssign: 'WorkOrder/GetAssetclassFormToAddcategory',
  assignAssetClassToWO: 'WorkOrder/AssignAssetClasstoWO',
  getAssetsToAssigninWO: 'WorkOrder/GetAssetsToAssigninWO',
  deleteS3BucketObject: 'WorkOrder/DeleteAWSS3Object',
  exportWorkOrderAssets: 'WorkOrder/ExportCompletedAssetsByWO',
  getAssetsToAssigninMWOInspection: 'WorkOrder/GetAssetsToAssigninMWOInspection',
  assignMultipleAssetToInspection: 'WorkOrder/AssignMultipleAssetClasstoWO',
  updateGroupName: 'WorkOrder/UpdateWOCategoryGroupString',
  updateMultiWOCategoryTaskStatus: 'WorkOrder/UpdateMultiWOCategoryTaskStatus',
  getWOCategoryTaskByWOId: 'workorder/GetAllWOCategoryTaskByWOid',
  workOrderWatching: 'User/AddUpdateWorkOrderWatcher',
  getTimeMaterials: 'WorkOrder/GetAllTimeMaterialsForWO',
  addUpdateTimeMaterial: 'WorkOrder/AddUpdateTimeMaterial',
  bulkCreateTimeMaterialsWoLine: 'WorkOrder/BulkCreateTimeMaterialsForWO',
  getAssetsWithQRCode: 'WorkOrder/GetAllOBAssetsWithQRCodeByWOId',
  exportTempAssetsExport: 'WorkOrder/GetAllTempAssetDataForWO',

  onBoardingWorkorder: {
    uploadAsset: 'WorkOrder/UploadAssettoOBWO',
    deleteAsset: 'WorkOrder/DeleteOBWOAsset',
    getDetails: 'WorkOrder/ViewOBWODetailsById',
    getAssetDetails: 'WorkOrder/GetOBWOAssetDetailsById',
    getAssetDetails_V2: 'WorkOrder/GetOBWOAssetDetailsById_V2',
    uploadPhoto: 'WorkOrder/UploadOBWOAssetImage',
    updateAssetDetails: 'WorkOrder/UpdateOBWOAssetDetails',
    updateAssetStatus: 'WorkOrder/UpdateOBWOAssetStatus',
    updateWOStatus: 'WorkOrder/UpdateOBWOStatus',
    uploadIRPhotos: 'WorkOrder/UploadIRPhotos',
    getIRPhotos: 'WorkOrder/GetOBIRImagesByWOId',
    getIRPhotosV2: 'WorkOrder/GetOBIRImagesByWOId_V2',
    textRact: 'WorkOrder/GetImageInfoByTextRact',
    namePlateJsonForm: 'Asset/GetNameplateJsonFromImages',
    responsibleParty: 'WorkOrder/GetAllResponsiblePartyList',
    changeQuoteStatus: 'WorkOrder/ChangeQuoteStatus',
    downloadReport: 'WorkOrder/GenerateOnboardingWOReport',
    downloadMaintenanceReport: 'WorkOrder/GenerateMaintenanceWOReport',
    fedBy: {
      getList: 'Asset/GetOBTopLevelFedByAssetList',
      create: 'WorkOrder/AddOBFedByAsset',
      topSubHiararchy: 'Asset/GetTopLevelSubLevlComponentHiararchy',
    },
    pdf: {
      generate: 'WorkOrder/GenerateIRWOAssetReport',
      getStatus: 'WorkOrder/IRWOAssetReportStatus',
    },
    existingAsset: {
      get: `WorkOrder/GetAssetsToAssignOBWO`,
      add: `WorkOrder/AssignExistingAssettoOBWO`,
    },
    component: {
      uploadPhoto: 'WorkOrder/UploadOBComponentImages',
      getAssetsByLevel: 'WorkOrder/GetComponentLevelAssets',
    },
  },

  genericWorkorder: {
    checkCompletionStatus: 'WorkOrder/GetWOCompletedThreadStatus',
    getFormDataForBulkOpertaion: 'WorkOrder/GetAssetFormDataForBulkImport',
    getFormDataTemplate: 'FormIO/GetFormDataTemplateByFormId',
    bulkImportAssetForm: 'WorkOrder/BulkImportAssetFormIO',
    bulkImportAssetFormStatus: 'WorkOrder/BulkImportAssetFormIOStatus',
    getAllCalendarWorkorders: 'WorkOrder/GetAllCalendarWorkorders',
  },

  createInspection: 'Inspection/CreateInspection',

  getAllForms: 'FormIO/GetAllForm',
  addUpdateForm: 'FormIO/AddUpdateFormIO',
  getAllFormNames: 'FormIO/GetAllFormNames',
  getAllFormTypes: 'FormIO/GetAllFormTypes',
  deleteForm: 'FormIO/DeleteForm',
  dashboardPieChartCount: 'FormIO/DashboardPIchartcount',
  dashboardMetricCount: 'FormIO/DashboardPropertiescounts',

  getAllAssetClass: 'FormIOAssetClass/GetAllAssetClass',
  getFormProperties: 'FormIOAssetClass/GetFormPropertiesByAssetclassID',
  getFormsByAssetclassID: 'FormIOAssetClass/GetFormsByAssetclassID',
  getFormIOFormById: 'FormIOAssetClass/GetFormIOFormById',
  getFormListToAddByAssetclassID: 'FormIOAssetClass/GetFormListtoAddByAssetclassID',
  addFormInAssetClass: 'FormIOAssetClass/AddFormInAssetClass',
  deleteFormFromAssetClass: 'FormIOAssetClass/DeleteFormFromAssetClass',
  deleteAssetClass: 'FormIOAssetClass/DeleteAssetClass',
  addAssetClass: 'FormIOAssetClass/AddAssetClass',
  addFormInAssetClass: 'FormIOAssetClass/AddFormInAssetClass',
  getAllAssetClassCodes: 'FormIOAssetClass/GetAllAssetClassCodes',
  assetClass: {
    nameplateInfo: {
      get: 'FormIOAssetClass/GetFormNameplateInfobyClassId',
      update: 'FormIOAssetClass/UpdateNamePlateinfo',
    },
    form: {
      getEquipmentList: 'AssetFormIO/GetAssetformEquipmentList',
      uploadAssetClassDocument: 'AssetFormIO/UploadDocumentForAssetClassForm',
    },
    maintenanceEstimate: {
      get: 'WorkOrder/GetPMEstimation',
    },
  },

  getAssetForm: 'AssetFormIO/GetAllAssetInspectionListByAssetId',
  getInsulationResistanceTests: 'AssetFormIO/GetFormIOInsulationResistanceTest',
  addUpdateAssetForm: 'AssetFormIO/AddUpdateAssetFormIO',
  getNameplateInfoByAssetid: 'Asset/GetNameplateInfoByAssetid',
  generateAssetInspectionFormioPdf: 'WorkOrder/GenerateAssetInspectionFormioReport',
  getPdfGenerationStatus: 'AssetFormIO/ReportStatus',
  updateAssetInfo: 'AssetFormIO/UpdateAssetInfo',
  updateSubmittedStatus: 'AssetFormIO/changeassetformiostatus',
  getWorkOrdersForSubmittedFilterOptionsByStatus: 'AssetFormIO/GetWorkOrdersForSubmittedFilterOptionsByStatus',
  geInspectedForSubmittedFilterOptions: 'AssetFormIO/GetInspectedForSubmittedFilterOptions',
  getAssetsForSubmittedFilterOptionsByStatus: 'AssetFormIO/GetAssetsForSubmittedFilterOptionsByStatus',
  getAssetsFormJson: 'AssetFormIO/GetAssetFormJsonbyId',
  changeAssetFormIOStatusFormultiple: 'AssetFormIO/ChangeAssetFormIOStatusFormultiple',
  getAssetformByIDForBulkReport: 'AssetFormIO/GetAssetformByIDForBulkReport',
  generateBulkNetaReport: 'AssetFormIO/GenerateBulkNetaReport',
  getAllNetaInspectionBulkReportTrackingList: 'AssetFormIO/GetAllNetaInspectionBulkReportTrackingList',

  //ASSETS
  asset: {
    attachments: {
      get: 'Asset/GetAssetAttachments',
      delete: 'Asset/DeleteAssetAttachments',
      upload: 'Asset/UploadAssetAttachments',
      UploadClusterOneLinePdf: 'Asset/UploadClusterOneLinePdf',
      GetUploadedOneLinePdfData: 'Asset/GetUploadedOneLinePdfData',
    },
    subComponents: {
      get: 'Asset/GetSubcomponentsByAssetId',
      update: 'Asset/UpdateCircuitForAssetSubcomponent',
      delete: 'Asset/DeleteAssetSubcomponent',
      addNew: 'Asset/AddNewSubComponent',
      getSubComponentsToAdd: 'Asset/GetSubcomponentAssetsToAddinAsset',
    },
    circuit: {
      get: 'Asset/GetAssetCircuitDetails',
      updateFedByCircuit: 'Asset/UpdateAssetFedByCircuit',
      updateFeedingCircuit: 'Asset/UpdateAssetFeedingCircuit',
      getFeedingCircuit: 'Asset/GetAssetFeedingCircuitForReport',
    },
    inspections: {
      maintenance: 'Asset/GetOBWOCompletedWOlinesOfRequestedAsset',
      updateOBWOStatus: 'WorkOrder/UpdateMultiOBWOAssetsStatus',
    },
    photos: {
      getAllImagesForAsset: 'Asset/GetAllImagesForAsset',
      deleteOrSetAsProfile: 'Asset/AssetImageDeleteOrSetAsProfile',
    },
    temp: {
      getDetails: 'Asset/GetAssetDetailsByIdForTempAsset',
    },
    uploadBulkMainAssets: 'Asset/UploadBulkMainAssets',
  },

  // EQUIPMENTS
  equipments: {
    getAllEquipmentList: 'AssetFormIO/GetAllEquipmentList',
    addUpdateEquipment: 'AssetFormIO/AddUpdateEquipment',
    deleteEquipment: 'AssetFormIO/DeleteEquipment',
    filterAttributesEquipment: 'AssetFormIO/FilterAttributesEquipment',
  },

  // PM
  preventativeMaintenance: {
    category: {
      get: 'PMCategory/Get',
    },
    plan: {
      get: 'PMPlans/Get',
      addUpdate: 'PMPlans/AddUpdatePMPlan',
      delete: 'PMPlans/Delete',
      markDefault: 'PMPlans/MarkDefaultPMPlan',
    },
    pm: {
      get: 'PM/Get',
      getById: 'PM/GetById',
      addUpdate: 'PM/AddUpdatePM',
      delete: 'PM/Delete',
      uploadAttachment: 'PM/UploadAttachment',
    },
    asset: {
      getPlans: 'AssetPM/GetPMPlansByClassId',
      getAssignedPMs: 'AssetPM/GetAssetPMList',
      getFilterDropdown: 'AssetPM/GetFilterDropdownAssetPMList',
      addPlan: 'AssetPM/AddAssetPM',
      removePM: 'AssetPM/RemoveAssetPM',
      getPM: 'AssetPM/GetById',
      getMetrics: 'AssetPM/AssetPMCount',
      update: 'AssetPM/Update',
      markComplete: 'AssetPM/MarkPMcompletedNewflow',
      exportAssetsLocationDetails: 'Asset/ExportAssetsLocationDetails',
      getAssetWise: 'AssetPM/GetAssetPMListAssetWise',
      getPMsByAssetId: 'PM/GetPMsListByAssetId',
      getPMsListByAssetClassId: 'PM/GetPMsListByAssetClassId',
      bulkCreateWOline: 'AssetPM/BulkCreatePMWOline',
      bulkCreateIRPMsWOline: 'AssetPM/BulkCreateIRAssetPMsAssetInIRWO',
      assetPMsStatus: 'AssetPM/EnableDisableAssetPMsStatus',
      getAssignedPMsOptimized: 'AssetPM/GetAssetPMListOptimized',
    },
    workOrder: {
      link: 'WorkOrder/LinkAssetPMToWO',
      linkToLine: 'AssetPM/LinkAssetPMToWOLine',
      getAssetPMConditionDataForExport: 'WorkOrder/GetAssetPMConditionDataForExport',
      addWoLine: 'WorkOrder/AddAssetPMWoline',
      manuallyAssignPm: 'PM/ManuallyAssignAnyPMtoWO',
      addPmToNewLine: 'WorkOrder/AddPMtoNewWoline',
    },
    forms: {
      get: 'WorkOrder/GetPMMasterFormByPMid',
      getLine: 'WorkOrder/GetAssetPMFormById',
      submit: 'WorkOrder/SubmitPMFormJson',
      uploadPhoto: 'WorkOrder/UploadWOPMFormImages',
    },
    report: {
      exportDuePMsReport: 'AssetPM/PMLastCompletedDateReport',
      bulkUploadLastCompletedPMs: 'AssetPM/BulkUpdatePMLastcompleted',
    },
  },

  // LOCATIONS
  locations: {
    get: 'WorkOrder/GetLocationHierarchyForWO',
    formOptions: 'WorkOrder/GetLocationHierarchyForWO_Version2',
    addUpdate: 'WorkOrder/AddAssetLocationData',
    getAssets: 'WorkOrder/GetAssetsToAssignOBWO',
    getAssetsbyLocationHierarchy: 'WorkOrder/GetAssetsbyLocationHierarchy',
    deleteLocationDetails: 'Asset/DeleteLocationDetails',
    updateLocationDetails: 'Asset/UpdateLocationDetails',
    changeSelectedAssetsLocation: 'Asset/ChangeSelectedAssetsLocation',
    addAssetLocationData: 'WorkOrder/AddAssetLocationData',
    workOrder: {
      get: 'WorkOrder/GetTempLocationHierarchyForWO',
      getV2: 'WorkOrder/GetTempLocationHierarchyForWO_V3',
      getAssets: 'WorkOrder/GetWOOBAssetsbyLocationHierarchy',
      addTemp: 'WorkOrder/AddTempLocationData',
      addExisting: 'WorkOrder/AddExistingtoTempLocation',
      delete: 'WorkOrder/DeleteTempMainLocationDetails',
      getActive: 'WorkOrder/GetActiveLocationByWO',
      editLocation: 'WorkOrder/EditLocationDetails',
    },
    workOrderV2: {
      addTemp: 'WorkOrder/AddNewTempMasterLocationData',
      addExisting: 'WorkOrder/AddExistingTempMasterLocation',
      getDropdownList: 'WorkOrder/GetAllTempMasterLocationDropdownList',
      get: 'WorkOrder/GetAllTempMasterLocationsListForWO',
      getAssets: 'WorkOrder/GetWOOBAssetsbyTempMasterLocationHierarchy',
    },
    columns: {
      getBuilding: 'Asset/GetAllBuildingLocations',
      getFloor: 'Asset/GetAllFloorsByBuilding',
      getFloorDropdown: 'Asset/GetAllFloorsByBuilding_Dropdown',
      getRoom: 'Asset/GetAllRoomsByFloor',
    },
  },

  // FACILITIES
  facilities: {
    company: {
      getAll: 'User/GetAllClientCompanyWithSites',
      create: 'User/CreateClientCompany',
    },
    site: {
      create: 'User/CreateUpdateSite',
      uploadPhoto: 'User/UploadSiteProfileImage',
    },
    getUserSitesAndRoles: 'User/GetActiveUserSitesAndRoles',
  },

  // USER
  user: {
    profile: {
      uploadPhoto: 'User/UploadUserProfilePicture',
      update: 'User/AddUpdateUser',
    },
    allTechnicianList: 'User/GetAllTechniciansList',
    filterUseroptimized: 'User/FilterUsersOptimized',
    backOfficeUsersList: 'User/GetAllBackOfficeUsersList',
    getProjectManagers: 'User/GetAllProjectManagersList',
  },

  vendor: {
    filteVendoroptimized: 'User/GetAllVendorList',
    addUpdateVendor: 'User/CreateUpdateVendor',
    viewVendorDetailById: 'User/ViewVendorDetailsById',
    createUpdateContact: 'User/CreateUpdateContact',
    getDropdown: 'User/GetAllVendorsContactsForDropdown',
    getContactsList: 'User/GetRefreshedContactsByWOId',
  },

  health: {
    createUpdateAssetGroup: 'Asset/CreateUpdateAssetGroup',
    assetGroupsDropdownList: 'Asset/AssetGroupsDropdownList',
    getAllAssetGroupsList: 'Asset/GetAllAssetGroupsList',
    assetListDropdownForAssetGroup: 'Asset/AssetListDropdownForAssetGroup',
  },

  //NOTIFICATION
  notification: {
    count: 'User/GetNotificationsCount',
    get: 'User/GetNotifications',
    updateNotificationStatus: 'User/UpdateNotificationsStatus',
    markAllRead: 'User/MarkAllNotificationStatus',
  },

  document: {
    get: 'Company/GetAllSiteDocument',
    upload: 'Company/UploadSiteDocument',
    delete: 'Company/DeleteSiteDocument',
  },
  reactFlow: {
    get: 'Asset/GetAllAssetsListForReactFlow',
    updatePosition: 'Asset/UpdateAssetsPositionForReactFlow',
  },

  getAllClassOrPmCategory: 'PMCategory/Get',
  getPmPlansByCategory: 'PMPlans/Get',
  addOrUpdatePMPlan: 'PMPlans/AddUpdatePMPlan',
  submittedAssetsCount: 'WorkOrder/GetWOTypeWiseSubmittedAssetsCount',

  sampleXslxlocal: 'https://asset-excel-reference-data.s3-us-west-2.amazonaws.com/Sample_Asset_Excel_Local.xlsx',
  sampleXslxDev: 'https://asset-excel-reference-data.s3-us-west-2.amazonaws.com/Sample_Asset_Excel_Dev.xlsx',
  sampleXslxProd: 'https://asset-excel-reference-data.s3-us-west-2.amazonaws.com/Sample_Asset_Excel_Prod.xlsx',

  // sampleOnboardingTemplate: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com/Onboarding+Template_dev.xlsx',
  sampleOnboardingTemplate: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com/Onboarding+Template.xlsx',
  // sampleInfraredScanTemplate: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com/IR+Scan+Template_dev.xlsx',
  sampleInfraredScanTemplate: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com/IR+Scan+Template.xlsx',
  sampleAcceptanceQuote: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com/Acceptance+Upload+Quote+Template.xlsx',
  s3TemplateHostURL: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com',
  sampleMainAsset: 'https://conduit-wo-templates.s3.us-east-2.amazonaws.com/BulkUpload_MainAsset.xlsx',

  noImageAvailable: 'https://condit-logo.s3.us-east-2.amazonaws.com/image_unavailable.png',
  invalidImage: 'https://condit-logo.s3.us-east-2.amazonaws.com/invalid-image.png',

  appUrlAc: 'http://localhost:3005/home/', //local
  generalLogin: 'http://localhost:3005/login', //local

  supportUrl: 'https://egalvanic.freshdesk.com/support/solutions',
}
export default URL
