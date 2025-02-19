import React, { useState, useEffect, useRef } from 'react'
import Drawer from '@material-ui/core/Drawer'
import CropFreeIcon from '@material-ui/icons/CropFree'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'
import { useTheme } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import Checkbox from '@material-ui/core/Checkbox'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import Snackbar from '@material-ui/core/Snackbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete, MinimalDatePicker, MinimalPhoneInput, MinimalToggleButton } from 'components/Assets/components'
import { MinimalButton, FloatingButton, MinimalButtonGroup } from 'components/common/buttons'
import { MinimalCheckbox, FormSection, PopupModal, LabelVal } from 'components/common/others'
import ImagePreview from 'components/common/image-preview'
import CreateFedBy from 'components/WorkOrders/onboarding/create-fed-by'
import { components } from 'react-select'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import deleteBucketObject from 'Services/WorkOrder/delete-bucket-obj'
import uploadQrCodeImage from 'Services/WorkOrder/upload-qr'
import assetClass from 'Services/FormIO/asset-class'
import useFetchData from 'hooks/fetch-data'
import issues from 'Services/issues'
import Chip from '@material-ui/core/Chip'

import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { get, isEmpty, differenceBy, startCase, filter, isNull, orderBy } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import {
  SectionTab,
  sectionNames,
  validate,
  imageTypeOptions,
  AssetImage,
  AssetImageUploadButton,
  conditionOptions,
  maintenanceOptions,
  criticalityOptions,
  PanelOptions,
  thermalClassificationOptions,
  locationOptions,
  thermalAnomalyProbableCauseOptions,
  thermalAnomalyRecommendationOptions,
  UltrasonicAnomalyOptions,
  necVoilationOptions,
  oshaVoilationOptions,
  physicalConditionOptions,
  fedByTypeOptions,
  fedByTypeOptionsName,
  subComponentColumns,
  racewayTypesOptions,
  conductorTypesOptions,
  fedByColumns,
  photoTypes,
  thermalAnomalySubComponentOptions,
  photoDuration,
  resolvedOptions,
  severityCriteriaOptions,
  arcFlashOptionsName,
  nfpa70bOption,
  subComponentPosition,
  connectionType,
  materialNonFlexType,
  conductorSizeOptions,
} from './utils'
import { SubComponentMultiplePhotoPop, SubComponentPhotoPop } from 'components/WorkOrders/onboarding/components'
import enums from 'Constants/enums'
import $ from 'jquery'
import { nanoid } from 'nanoid'
import { normalizeString } from '../utils'
import DialogPrompt from 'components/DialogPrompt'
import ViewTampCircuit from './view-tamp-circuit'
import { MAX_IMG_UPLOAD } from 'components/Assets/tree/constants'
import heic2any from 'heic2any'
import AddGroup from 'components/Health/add-group'
import health from 'Services/health'
import { EditOutlined } from '@material-ui/icons'

const styles = {
  fedbySectionDrpInputStyle: { fontSize: '12px', background: 'none', padding: '0.7px 6px', border: '1px solid #a1a1a1' },
}

const useStyles = makeStyles({
  table: {
    borderRadius: '5px',
    '& th': {
      fontWeight: 'bold',
      border: '1px solid rgba(224, 224, 224, 1)',
      padding: '10px 8px 5px 10px',
    },
    '& td': {
      border: '1px solid rgba(224, 224, 224, 1)',
      textAlign: 'center',
      padding: '10px 0px 0px 10px',
    },
  },
})

const Edit = ({ open, onClose, viewObj, afterSubmit, isNew, classCodeOptions, workOrderID, isOnboarding, lineObj = {}, isInReview, isAddingExisting, workOrderNumber, buildingOptions: buildingOpts = [], fixedLocations = {}, isInstalling, isQuote, photosType, irImageCount }) => {
  const classes = useStyles()
  const [error, setError] = useState({})
  const [photoError, setPhotoError] = useState('')
  const [photoErrorType, setPhotoErrorType] = useState('')
  const [uploadingPhotoType, setUploadingPhotoType] = useState({ type: 0, duration: 0 })
  const [asset, setAsset] = useState({})
  const [isPhotoUploading, setPhotoUploading] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])
  const [isSaving, setIsSaving] = useState('')
  const uploadRef = useRef(null)
  const uploadQrRef = useRef(null)
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [isQRUploading, setQRUploading] = useState(false)
  const [assetClassCode, setClassCode] = useState(null)
  // const [thermalClassification, setThermalClassification] = useState(null)
  const [location, setLocation] = useState(null)
  const [date, setDate] = useState(null)
  const theme = useTheme()
  const [irCount, setIrCount] = useState(isNew ? irImageCount + 1 : irImageCount)
  const [multipleFields, setMultipleFields] = useState([{ isDeleted: false }])
  const [fedByOptions, setFedByOptions] = useState([])
  const [fedByLoading, setFedByLoading] = useState(false)
  const [nameplateInfoLoading, setNameplateInfoLoading] = useState(false)
  const [physicalCondition, setPhysicalCondition] = useState(null)
  const [codeCompliance, setCodeCompliance] = useState(null)
  const [virPhotoNum, setVirPhotoNum] = useState([{ irPhoto: `FLIR-${irCount}`, visualPhoto: `FLIR-${irCount}-visual`, type: imageTypeOptions[0], isDeleted: false, id: nanoid(), irwoimagelabelmappingId: null }])
  const [photoNoTypeErrorIndexes, setPhotoNoTypeErrorIndexes] = useState([])
  //fed by
  const [isCreateFedByOpen, setCreateFedByOpen] = useState(false)
  const [isExistingFedByOpen, setExistingFedByOpen] = useState([false, false, null])
  const [isNewFedByCreated, setNewFedByCreated] = useState(false)
  const [fedByList, setFedByList] = useState([])
  const scrollableDiv = useRef(null)
  const formDiv = useRef(null)
  //nameplate
  const [nameplateInformation, setNameplateInformation] = useState({})
  //component
  const [componentType, setComponentType] = useState(enums.COMPONENT_TYPE.TOP_LEVEL)
  const formSectionNames = sectionNames(isOnboarding, componentType === enums.COMPONENT_TYPE.SUB_COMPONENT)
  const [activeSectionName, setActiveSectionName] = useState(formSectionNames[0])
  const [subComponentList, setSubComponentList] = useState([])
  const isTopLevelComponent = componentType === enums.COMPONENT_TYPE.TOP_LEVEL
  //const [topLevelComponentOptions, setTopLevelComponentOptions] = useState([])
  const [topLevelComponent, setTopLevelComponent] = useState(null)
  const uploadSubComponentPhotoRef = useRef([])
  uploadSubComponentPhotoRef.current = subComponentList.map((element, i) => uploadSubComponentPhotoRef.current[i] ?? React.createRef())
  const [isSubComponentPopupOpen, setSubComponentPopupOpen] = useState(false)
  const [subComponentPhotoInfo, setSubComponentPhotoInfo] = useState({})
  const payloadForTopLevelComps = snakifyKeys({ woId: workOrderID, componentLevelTypeId: enums.COMPONENT_TYPE.TOP_LEVEL })
  const formatTopLevelOptions = d => {
    const main = get(d, 'mainAssetsList', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
    const line = get(d, 'wolineAssets', []).map(d => ({ ...d, label: d.assetName, value: d.woonboardingassetsId, isOB: true }))
    return [...main, ...line]
  }

  const sortAssetGroup = d => {
    let sortedList = get(d, 'data.list', [])
    if (!isEmpty(sortedList)) {
      sortedList = sortedList.map(item => ({
        ...item,
        label: item.assetGroupName,
        value: item.assetGroupId,
      }))
    }
    // sortedList = orderBy(sortedList, [item => item.label && item.label.toLowerCase()], 'asc')
    return sortedList
  }

  const { initialLoading, data: topLevelComponentOptions } = useFetchData({ fetch: onBoardingWorkorder.component.getAssetsByLevel, payload: payloadForTopLevelComps, formatter: d => formatTopLevelOptions(get(d, 'data', {})), defaultValue: [], condition: isTopLevelComponent === false })
  const { loading, data: assetGroupData, reFetch } = useFetchData({ fetch: health.getAssetGroupsDropdownList, formatter: d => sortAssetGroup(d), externalLoader: true })

  //reject
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  //others
  const [otherAssetInfo, setOtherAssetInfo] = useState({})
  const [imageOrder, setImageOrder] = useState(0)
  //locations
  const [buildingOptions, setBuildingOptions] = useState(buildingOpts)
  const [floorOptions, setFloorOptions] = useState([])
  const [roomOptions, setRoomOptions] = useState([])
  const [randomValue, setRandomValue] = useState(Math.random())
  // OCR
  const [openImageDrawer, setOpenImageDrawer] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [extractedJson, setExtractedJson] = useState([])
  const [copied, setCopied] = useState(false)
  const [imageDrawerLoading, setImageDrawerLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [imageObject, setImageObject] = useState({})

  // fedBy top level sub level Hiararchy
  const [topLevelAsset, setTopLevelAsset] = useState([])
  const [subLevelAsset, setSubLevelAsset] = useState([])
  const [fedByType, setFedByType] = useState(1)
  const [conductorLength, setConductorLength] = useState('')
  const [conductorName, setConductorName] = useState('')
  const [conductorSize, setConductorSize] = useState('')
  const [racewayType, setRacewayType] = useState([])
  const [conductorType, setConductorType] = useState([])
  const [subComponentAssetOptions, setSubComponentAssetOptions] = useState([])
  const [topComponentAssetOptions, setTopComponentAssetOptions] = useState([])
  const [mainSubOtions, setMainSubOptions] = useState([])
  const [assetSubComponentOptions, setAssetSubComponentOptions] = useState([])
  const [assetIrOptions, setIrPhotoOptions] = useState([])
  const [subComponentAsset, setSubComponentAsset] = useState([])
  const [includedFedBy, setIncludedFedBy] = useState([])
  const [issueFlag, setIssueFlag] = useState(false)
  const [multiIssueList, setMultiIssueList] = useState([])
  const [multiIssuePhotosId, setMultiIssuePhotosId] = useState(0)
  const [issueImageList, setIssueImageList] = useState([])
  const [isDeleteIssueOpen, setDeleteIssueOpen] = useState([false, 0])
  const [isShowPanel, setShowPanel] = useState(false)
  const [isOpenCircuitView, setIsOpenCircuitView] = useState(false)
  const [namePlateJson, setNamePlateJson] = useState(null)
  const [hideFillButton, setHideFillButton] = useState(false)
  const [estimateData, setEstimateData] = useState(null)
  const [changeLineSide, setChangeLineSide] = useState([false, null, false])
  const [lineLoadSidePosition, setLineLoadSidePosition] = useState(null)
  const selectedChipRef = useRef(false)
  const [assetGroup, setAssetGroup] = useState(null)
  const [isOpenAddDrawer, setOpenAddDrawer] = useState(false)
  const [selectedAssetGroup, setSelectedAssetGroup] = useState(null)

  const [conductorJson, setConductorJson] = useState([{ amount: 1, material: 'Copper', size: conductorSizeOptions[0], id: 0 }])
  const [diaMeter, setDiaMeter] = useState(1)
  const [length, setLength] = useState(50)
  const [sets, setSets] = useState(1)
  const [connectType, setConnectType] = useState(connectionType[0].value)
  const [material, setMaterial] = useState(materialNonFlexType[0].value)

  useEffect(() => {
    if (isExistingFedByOpen[2] === null) {
      if (connectType === 1) setMaterial(materialNonFlexType[0].value)
      if (connectType === 2) setMaterial(materialNonFlexType[4].value)
    }
  }, [connectType])

  const formatTopLevelHiararchy = data => {
    const mainList = get(data, 'toplevelMainAssets', []) || []
    const obList = get(data, 'toplevelObwoAssets', []) || []
    const mainOpts = mainList.map(asset => ({ ...asset, label: asset.assetName, value: asset.assetId }))
    const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
    const topComponentAsset = orderBy([...mainOpts, ...obOpts], [e => e.label && e.label.toLowerCase()], ['asc'])

    const mainSub = get(data, 'subcomponentMainAssets', []) || []
    const obSub = get(data, 'subcomponentObwoAssets', []) || []
    const mainSubOpts = mainSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.assetId }))
    const obSubOpts = obSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.woonboardingassetsId, isOB: true }))
    const subComponentAsset = orderBy([...mainSubOpts, ...obSubOpts], [e => e.label && e.label.toLowerCase()], ['asc'])
    setSubComponentAssetOptions(subComponentAsset)
    setMainSubOptions(subComponentAsset)
    setTopComponentAssetOptions(topComponentAsset)

    if (!isNew || isAddingExisting) {
      const fedByKey = isAddingExisting ? 'assetParentMappingList' : 'woObAssetFedByMapping'
      const fedIDs = get(viewObj, [fedByKey], []).map(d => ({ ...d, parentID: d.parentAssetId }))

      const fedByTypes = get(viewObj, [fedByKey], []).reduce((acc, d) => {
        acc[d.parentAssetId] = {
          // type: d.fedByUsageTypeId,
          // length: get(d, 'length', ''),
          // style: get(d, 'style', ''),
          ocp: d.fedByViaSubcomponantAssetId,
          subComponentAsset: d.viaSubcomponantAssetId,
          // conductorType: d.conductorTypeId,
          // conductorName: get(d, 'numberOfConductor', ''),
          // racewayType: d.racewayTypeId,
          isParentFromObWo: d.isParentFromObWo,
          fedbyDetailsJson: d.fedbyDetailsJson,
        }
        return acc
      }, {})

      const subAssetOptions = get(viewObj, 'woObAssetSublevelcomponentMapping', []).map(d => ({ ...d, name: d.sublevelcomponentAssetName, value: d.sublevelcomponentAssetId, isSublevelcomponentFromObWo: d.isSublevelcomponentFromObWo, isTemp: false }))
      const fedByList = topComponentAsset
        .filter(d => fedIDs.some(v => (v.isParentFromObWo === false ? v.parentID === d.assetId : v.parentID === d.woonboardingassetsId)))
        .map((d, index) => {
          const idToCheck = fedIDs.some(v => v.isParentFromObWo === false && v.parentID === d.assetId) ? d.assetId : d.woonboardingassetsId
          const fedByData = get(fedByTypes, [idToCheck], {})
          return {
            fedBy: { ...d, name: d.label },
            // type: fedByData.type,
            id: index + 1,
            // length: fedByData.length,
            // style: fedByData.style,
            ocp: subComponentAsset.find(val => val.value === fedByData.ocp),
            subComponentAsset: subAssetOptions.find(d => d.lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE),
            // conductorType: conductorTypesOptions.find(type => type.value === fedByData.conductorType),
            // conductorName: fedByData.conductorName,
            // racewayType: racewayTypesOptions.find(type => type.value === fedByData.racewayType),
            fedbyDetailsJson: fedByData.fedbyDetailsJson,
          }
        })
      setSubComponentAsset(subAssetOptions.find(d => d.lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE))
      setIncludedFedBy(fedByList.map(val => get(val, 'fedBy.value')))
      if (!isEmpty(fedByList)) {
        setFedByList(fedByList)
      }
    }

    return { subComponentAsset, topComponentAsset }
  }

  // panel logic
  useEffect(() => {
    if (!isEmpty(assetClassCode)) {
      setShowPanel(get(assetClassCode, 'classType', '')?.includes('PANELS') ? true : false)
    }
  }, [assetClassCode])

  const { loading: topSubLevlHiararchyLoading, data: topSubLevlHiararchy } = useFetchData({
    fetch: onBoardingWorkorder.fedBy.topSubHiararchy,
    payload: { id: isNew ? workOrderID : `${workOrderID}/${viewObj.woonboardingassetsId}` },
    formatter: d => formatTopLevelHiararchy(get(d, 'data', {})),
    defaultValue: [],
    condition: isNew === true || (!isNew && !isNull(viewObj.componentLevelTypeId) && viewObj.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL),
  })
  //
  const CustomOptions = ({ children, ...props }) => {
    return (
      <components.Option {...props}>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='text-bold'>{props.data.className} </div>
          <div className='text-bold text-accent'>{props.data.label}</div>
        </div>
      </components.Option>
    )
  }
  const CustomOptionsForSubComponent = ({ children, ...props }) => {
    return (
      <components.Option {...props}>
        <div style={{ maxWidth: '169px' }}>
          <div className='text-bold text-accent text-xs'>{props.data.label}</div>
          <div className='text-bold text-sm'>{props.data.className} </div>
        </div>
      </components.Option>
    )
  }

  useEffect(() => {
    const images = isAddingExisting ? [...get(viewObj, 'assetNameplateImages', []), ...get(viewObj, 'assetProfileImages', [])] : get(viewObj, 'assetImageList', [])
    images.forEach(im => {
      im.url = im.assetPhoto
      im.assetPhoto = im.assetPhoto.split('/')[5]
    })
    const flaggedIssues = { repair: false, replace: false, other: false }

    setUploadedImages(images)
    setAsset(viewObj)
    let classCode = null
    classCodeOptions.forEach(d => {
      if (!isEmpty(viewObj.assetClassCode) && d.label.toLowerCase() === viewObj.assetClassCode.toLowerCase()) classCode = d
    })
    setClassCode(classCode)
    setShowPanel(get(viewObj, 'assetClassType', '')?.includes('PANELS') ? true : false)
    setLineLoadSidePosition(get(viewObj, 'lineLoadTypeId', null))
    // Asset Subcomponent
    // const subAssetOptions = orderBy(
    //   get(viewObj, 'woObAssetSublevelcomponentMapping', []).map(d => ({ label: d.sublevelcomponentAssetName, value: d.sublevelcomponentAssetId, isSublevelcomponentFromObWo: d.isSublevelcomponentFromObWo, isTemp: false })),
    //   [e => e.label && e.label.toLowerCase()],
    //   ['asc']
    // )
    // setAssetSubComponentOptions(subAssetOptions)

    if (!isNew || isAddingExisting) {
      if (viewObj.commisiionDate) {
        const dueD = new Date(viewObj.commisiionDate)
        setDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
      } else setDate(null)
    }
    setLocation(isAddingExisting ? get(viewObj, 'assetPlacement', null) : get(viewObj, 'location', null))
    setCodeCompliance(get(viewObj, 'codeCompliance', null))
    setPhysicalCondition(physicalConditionOptions.find(d => d.value === viewObj.assetOperatingConditionState))
    const noneFlag = !viewObj.flagIssueThermalAnamolyDetected && !viewObj.flagIssueNecViolation && !viewObj.flagIssueOshaViolation && !flaggedIssues.repair && !flaggedIssues.replace && !flaggedIssues.other

    if (!isOnboarding || isAddingExisting) {
      const images = get(viewObj, 'obIrImageLabelList', []).map(d => {
        const type = !isEmpty(d.irImageLabel) ? `.${d.irImageLabel.split('.')[1]}` : !isEmpty(d.visualImageLabel) ? `.${d.visualImageLabel.split('.')[1]}` : null
        return {
          ...d,
          irPhoto: !isEmpty(d.irImageLabel) ? d.irImageLabel.split('.')[0] : null,
          visualPhoto: !isEmpty(d.visualImageLabel) ? d.visualImageLabel.split('.')[0] : null,
          type: imageTypeOptions.find(t => t.value === type?.toLowerCase()),
          irwoimagelabelmappingId: !isEmpty(d.irwoimagelabelmappingId) ? d.irwoimagelabelmappingId : null,
          isDeleted: !isEmpty(d.isDeleted) ? d.isDeleted : false,
        }
      })
      if (!isEmpty(images)) setVirPhotoNum(images)
      if ((!isNew || isAddingExisting) && !isEmpty(images)) {
        // images.push({ irPhoto: `${irCount}`, visualPhoto: `${irCount}-visual`, type: imageTypeOptions[0], isDeleted: false, id: nanoid(), irwoimagelabelmappingId: null })
        setMultipleFields(images)
      }
      setOtherAssetInfo(JSON.parse(get(viewObj, `dynmicFieldsJson`, '{}')))
    }
    //
    if (!isNew) setComponentType(viewObj.componentLevelTypeId)
    if (!isEmpty(viewObj.woObAssetSublevelcomponentMapping)) {
      const subCompList = viewObj.woObAssetSublevelcomponentMapping.map((d, i) => ({
        ...d,
        id: i + 1,
        name: d.sublevelcomponentAssetName || '',
        classData: classCodeOptions.find(cc => cc.id === d.sublevelcomponentAssetClassId),
        error: { name: null, classData: null },
        circuit: d.circuit,
        npPhoto: isEmpty(d.imageName) ? null : { fileUrl: d.imageUrl, filename: d.imageName },
        lineLoadSideId: get(d, 'lineLoadSideId', null),
        subcomponentImageList: get(d, 'subcomponentImageList', []),
      }))
      setSubComponentList(subCompList)
    }
    //fixed locations
    if (!isInstalling && (!isEmpty(fixedLocations) || !isNew)) {
      const selected = { building: !isNew ? viewObj.tempMasterBuilding : fixedLocations.building, floor: !isNew ? viewObj.tempMasterFloor : fixedLocations.floor, room: !isNew ? viewObj.tempMasterRoom : fixedLocations.room }
      let building = buildingOptions.find(d => d.value === selected.building)
      if (isEmpty(building)) {
        building = buildingOptions.find(d => normalizeString(d.label) === normalizeString(selected.building))
      }
      const floorOpts = get(building, 'tempMasterFloor', []).map(d => ({ ...d, label: d.floorName, value: d.tempMasterFloorId }))
      let floor = floorOpts.find(d => d.value === selected.floor)
      if (isEmpty(floor)) {
        floor = floorOpts.find(d => normalizeString(d.label) === normalizeString(selected.floor))
      }
      const roomOpts = get(floor, 'tempMasterRooms', []).map(d => ({ ...d, label: d.roomName, value: d.tempMasterRoomId }))
      let room = roomOpts.find(d => d.value === selected.room)
      if (isEmpty(room)) {
        room = roomOpts.find(d => normalizeString(d.label) === normalizeString(selected.room))
      }
      setRoomOptions(roomOpts)
      setFloorOptions(floorOpts)
      setAsset(asset => ({ ...asset, building, floor, room }))
    }
    if (get(viewObj, `tempAssetDetails.panelSchedule`, '')) {
      const panel = PanelOptions.find(d => d.value === get(viewObj, `tempAssetDetails.panelSchedule`, null))
      setAsset(asset => ({ ...asset, panelSchedule: get(panel, 'value', null) }))
    }
    if (get(viewObj, `tempAssetDetails.arcFlashLabelValid`, null)) {
      const flash = arcFlashOptionsName.find(d => d.value === get(viewObj, `tempAssetDetails.arcFlashLabelValid`, null))
      setAsset(asset => ({ ...asset, arcFlashLabelValid: get(flash, 'value', null) }))
    }

    // multiflag Issue
    if (!isEmpty(viewObj, 'wolineIssueList')) {
      const existingList = get(viewObj, 'wolineIssueList', [])
      const structuredList = existingList.map((d, index) => ({
        ...d,
        id: index + 1,
        isIssueLinkedForFix: resolvedOptions.find(v => v.value === get(d, 'isIssueLinkedForFix', false)),
        necViolation: necVoilationOptions.find(v => v.value === get(d, 'necViolation', null)) || null,
        oshaViolation: oshaVoilationOptions.find(v => v.value === get(d, 'oshaViolation', null)) || null,
        nfpa70BViolation: nfpa70bOption.find(v => v.value === get(d, 'nfpa70BViolation', null)) || null,
        thermalClassification: thermalClassificationOptions.find(v => v.value === get(d, 'thermalClassificationId', null)) || null,
        typeOfUltrasonicAnamoly: UltrasonicAnomalyOptions.find(v => v.value === get(d, 'typeOfUltrasonicAnamoly', null)) || null,
        thermalAnomalySubComponant: thermalAnomalySubComponentOptions.find(v => v.value === get(d, 'thermalAnomalySubComponant', '') || null),
        issueImageList: get(d, 'wolineIssueImageList', []).map(im => ({
          ...im,
          assetPhoto: im.assetPhoto?.split('/')[4],
          url: im.assetPhoto,
        })),
        dynamicFieldJson: isEmpty(get(d, 'dynamicFieldJson', null)) ? null : JSON.parse(get(d, 'dynamicFieldJson', null)),
        isAbcPhaseRequiredForReport: get(d, 'isAbcPhaseRequiredForReport', false),
        selectedChips: get(d, 'selectedChips', []),
        thermalAnomalyMeasuredAmps: difference(Number(get(d, 'thermalAnomalyMeasuredTemps', 0)), Number(get(d, 'thermalAnomalyRefrenceTemps', 0))),
      }))
      setMultiIssueList(structuredList)
      setIssueFlag(structuredList?.length >= 1 ? true : false)
    }
    setError({})
  }, [viewObj, classCodeOptions, isNew, isOnboarding, workOrderID])

  useEffect(() => {
    let assetGroup = null
    if (!isEmpty(assetGroupData)) {
      assetGroupData.forEach(d => {
        if (viewObj?.assetGroupId !== null && !isEmpty(viewObj.assetGroupId) && d.value === viewObj.assetGroupId) assetGroup = d
        if (selectedAssetGroup !== null && !isEmpty(selectedAssetGroup) && d.value === selectedAssetGroup) {
          assetGroup = d
        }
      })
    }
    setAssetGroup(assetGroup)
    setSelectedAssetGroup(null)
  }, [assetGroupData])

  const handleUpload = ({ type, duration, multiIssueID }) => {
    const key = `${type}_${duration}_${multiIssueID}`
    setPhotoError(prev => ({ ...prev, [key]: '' }))
    setUploadingPhotoType({ type, duration, multiIssueID })
    uploadRef.current && uploadRef.current.click()
  }

  const addPhoto = e => {
    e.preventDefault()

    const files = Array.from(e.target.files)

    if (files.length > MAX_IMG_UPLOAD) {
      Toast.error(`You can upload up to ${MAX_IMG_UPLOAD} images at a time.`)
      return
    }

    const formData = new FormData()
    let hasImgError = false
    const key = `${uploadingPhotoType.type}_${uploadingPhotoType.duration}_${uploadingPhotoType.multiIssueID}`
    const validExtensions = ['heif', 'heic', 'jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF', 'HEIF', 'HEIC']

    files.forEach((file, index) => {
      const extension = file.name.split('.').slice(-1).pop().toLowerCase()

      if (!validExtensions.includes(extension)) {
        setPhotoError(prev => ({ ...prev, [key]: 'Invalid Image format!' }))
        hasImgError = true
        return
      }

      formData.append('file', file)
      const reader = new FileReader()
      reader.onload = d => {
        if (!hasImgError && index === files.length - 1) {
          setPhotoError(prev => ({ ...prev, [key]: '' }))
          uploadPhoto(formData, uploadingPhotoType)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = null
  }

  const uploadPhoto = async (formData, { type, duration, multiIssueID }) => {
    const key = `${type}_${duration}_${multiIssueID}`
    setPhotoUploading(prev => ({ ...prev, [key]: true }))
    try {
      const res = [photoTypes.repair, photoTypes.replace, photoTypes.other, photoTypes.osha, photoTypes.nec, photoTypes.thermal, photoTypes.ultrasonic, photoTypes.nfpa70b].includes(uploadingPhotoType.type) ? await issues.uploadPhoto(formData) : await onBoardingWorkorder.uploadPhoto(formData)
      if (res.success) {
        if ([photoTypes.repair, photoTypes.replace, photoTypes.other, photoTypes.osha, photoTypes.nec, photoTypes.thermal, photoTypes.ultrasonic, photoTypes.nfpa70b].includes(uploadingPhotoType.type)) {
          const issueList = [...multiIssueList]
          const findIssue = issueList.find(d => d.id === multiIssuePhotosId)
          if (findIssue) {
            const oldImages = findIssue.issueImageList || []
            if (!isEmpty(res.data.imageList)) {
              const imgList = res.data.imageList.map(dd => {
                return {
                  url: dd.fileUrl,
                  assetPhotoType: uploadingPhotoType.type,
                  woonboardingassetsimagesmappingId: null,
                  wolineIssueImageMappingId: null,
                  assetPhoto: dd.filename,
                  assetThumbnailPhoto: dd.thumbnailFilename,
                  imageDurationTypeId: uploadingPhotoType.duration,
                  isDeleted: false,
                  thumbnailFileUrl: dd.thumbnailFileUrl,
                  assetThumbnailPhoto: dd.thumbnailFilename,
                  woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
                }
              })

              findIssue.issueImageList = [...oldImages, ...imgList]
            } else {
              Toast.error(res.message)
            }
          }
          setMultiIssueList(issueList)
          setMultiIssuePhotosId(0)
        } else {
          if (!isEmpty(res.data.imageList)) {
            const imgList = res.data.imageList.map(d => {
              return {
                url: d.fileUrl,
                assetPhoto: d.filename,
                assetPhotoType: uploadingPhotoType.type,
                imageDurationTypeId: uploadingPhotoType.duration,
                woonboardingassetsimagesmappingId: null,
                isDeleted: false,
                thumbnailFileUrl: d.thumbnailFileUrl,
                assetThumbnailPhoto: d.thumbnailFilename,
                woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
              }
            })
            setUploadedImages([...uploadedImages, ...imgList])
          } else {
            Toast.error(res.message)
          }
        }
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading image !')
    } finally {
      setPhotoUploading(prev => ({ ...prev, [key]: false }))
    }
  }
  const removeImage = (image, issueID) => {
    if ([photoTypes.repair, photoTypes.replace, photoTypes.other, photoTypes.osha, photoTypes.nec, photoTypes.thermal, photoTypes.ultrasonic, photoTypes.nfpa70b].includes(image.assetPhotoType)) {
      const issueImage = multiIssueList.find(d => d.id === issueID)
      const images = [...issueImage.issueImageList]
      const imageToDelete = images.find(img => img.assetPhoto === image.assetPhoto)

      if (imageToDelete) {
        if (isEmpty(imageToDelete.wolineIssueImageMappingId)) {
          const actualUploadedImageList = images.filter(e => e !== imageToDelete)
          const updatedMultiIssueList = multiIssueList.map(val => {
            if (val.id === issueID) {
              return { ...val, issueImageList: actualUploadedImageList }
            }
            return val
          })
          // Update the state here
          setMultiIssueList(updatedMultiIssueList)
        } else {
          const updatedImages = images.map(img => {
            if (img.assetPhoto === imageToDelete.assetPhoto) {
              return { ...img, isDeleted: true }
            }
            return img
          })
          const updatedMultiIssueList = multiIssueList.map(val => {
            if (val.id === issueID) {
              return { ...val, issueImageList: updatedImages }
            }
            return val
          })
          // Update the state here
          setMultiIssueList(updatedMultiIssueList)
        }
      }
    } else {
      const images = [...uploadedImages]
      const imageToDelete = images.find(img => img.assetPhoto === image.assetPhoto)
      if (isEmpty(imageToDelete.woonboardingassetsimagesmappingId)) {
        const actualUploadedImageList = uploadedImages.filter(e => e !== imageToDelete)
        setUploadedImages(actualUploadedImageList)
      } else {
        imageToDelete.isDeleted = true
        setUploadedImages(images)
      }
    }
  }

  const handleInputChange = (name, value) => setAsset({ ...asset, [name]: value })
  const validateForm = async status => {
    const payload = { assetName: asset.assetName, assetClassCode: get(assetClassCode, 'label', ''), building: get(asset, 'building.value', ''), floor: get(asset, 'floor.value', ''), room: get(asset, 'room.value', '') }
    const isValid = await validate(payload, isInstalling)
    setError(isValid)
    const errorTypes = []
    virPhotoNum.forEach(d => {
      if ((!isEmpty(d.irPhoto) || !isEmpty(d.visualPhoto)) && isEmpty(d.type)) errorTypes.push(true)
      else errorTypes.push(false)
    })
    setPhotoNoTypeErrorIndexes(errorTypes)
    const isTypeValid = errorTypes.includes(true)
    const subComponentErrors = []
    const subCompList = [...subComponentList]
    if (!isEmpty(subComponentList) && isTopLevelComponent) {
      subCompList.forEach(d => {
        const err = {}
        if (isEmpty(d.name)) err['name'] = { error: true, msg: 'Name is required !' }
        if (isEmpty(d.classData)) err['classData'] = { error: true, msg: 'Class is required !' }
        if (!isEmpty(err)) {
          d.error = err
          if (get(assetClassCode, 'is_allowed_subcomponent', false) === true) subComponentErrors.push(true)
        }
      })
      setSubComponentList(subCompList)
    }

    const multiFlagIssue = [...multiIssueList]
    const multiIsseErrors = []
    if (!isEmpty(multiIssueList)) {
      multiFlagIssue.forEach(d => {
        const err = {}
        if (isEmpty(d.thermalClassification) && d.issueType === enums.ISSUE.TYPE.THERMAL_ANAMOLY) err['thermalClassification'] = { error: true, msg: 'Thermal Classification is required !' }
        // if (isEmpty(d.thermalAnomalyProbableCause) && d.issueType === enums.ISSUE.TYPE.THERMAL_ANAMOLY) err['thermalAnomalyProbableCause'] = { error: true, msg: 'Problem Description is required !' }
        if (isEmpty(d.necViolation) && d.issueCausedId === enums.ISSUE.CAUSED.NEC_VIOLATION) err['necViolation'] = { error: true, msg: 'Code Violation is required !' }
        if (isEmpty(d.oshaViolation) && d.issueCausedId === enums.ISSUE.CAUSED.OSHA_VIOLATION) err['oshaViolation'] = { error: true, msg: 'Code Violation is required !' }
        if (isEmpty(d.nfpa70BViolation) && d.issueCausedId === enums.ISSUE.CAUSED.NFPA_70B_VIOLATION) err['nfpa70BViolation'] = { error: true, msg: 'NFPA 70B Violation is required !' }
        if (isEmpty(d.typeOfUltrasonicAnamoly) && d.issueType === enums.ISSUE.TYPE.ULTRASONIC_ANOMALY) err['typeOfUltrasonicAnamoly'] = { error: true, msg: 'Type of Ultrasonic Anamoly is required !' }
        if (isEmpty(d.issueTitle) && (d.issueType === enums.ISSUE.TYPE.REPAIR || d.issueType === enums.ISSUE.TYPE.REPLACE || d.issueType === enums.ISSUE.TYPE.OTHER)) err['issueTitle'] = { error: true, msg: 'Issue Title is required !' }
        if (!isEmpty(err)) {
          d.error = err
          multiIsseErrors.push(true)
        }
      })
      setMultiIssueList(multiFlagIssue)
    }
    // Estimation
    const estimationIssue = [...(estimateData?.pmEstimationList || [])]
    const estimationErrors = []
    if (!isEmpty(estimationIssue)) {
      estimationIssue.forEach(d => {
        const err = {}
        if (d.estimationTime < 0) err['estimationTime'] = { error: true, msg: 'Please enter a valid Estimated Time' }
        if (!isEmpty(err)) {
          d.error = err
          estimationErrors.push(true)
        }
      })
      setEstimateData(prev => ({
        ...prev,
        pmEstimationList: estimationIssue,
      }))
    }
    if (isValid === true && !isTypeValid && isEmpty(subComponentErrors) && isEmpty(multiIsseErrors) && isEmpty(estimationErrors)) submitData(status)
  }
  const submitData = async status => {
    const payload = { ...asset }

    payload.assetImageList = uploadedImages.filter(d => !(d.isDeleted && !d.woonboardingassetsimagesmappingId) || !(d.isDeleted && !d.wolineIssueImageMappingId))
    payload.status = status
    payload.assetClassCode = get(assetClassCode, 'label', '')
    payload.assetGroupId = get(assetGroup, 'value', null)
    payload.commisiionDate = date !== null ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null
    payload.assetOperatingConditionState = get(physicalCondition, 'value', null)
    payload.isWoLineForExisitingAsset = !!isAddingExisting || !!viewObj.isWoLineForExisitingAsset
    payload.location = location
    payload.codeCompliance = codeCompliance
    payload.lineLoadTypeId = get(assetClassCode, 'is_line_load_side_allowed', false) === true ? lineLoadSidePosition : null

    const nameplateData = {}
    if (!isEmpty(nameplateInformation)) {
      Object.keys(nameplateInformation).forEach(key => {
        nameplateData[key] = nameplateInformation[key]['type'] === 'select' ? get(nameplateInformation[key], ['value'], null) : get(nameplateInformation[key], ['value'], '')
      })
    }
    payload.formNameplateInfo = JSON.stringify(nameplateData)
    payload.dynmicFieldsJson = JSON.stringify(otherAssetInfo)

    if (!isOnboarding) {
      const ims = virPhotoNum.filter(d => !isEmpty(d.irPhoto) || !isEmpty(d.visualPhoto))
      const images = isEmpty(ims)
        ? []
        : ims.map(d => ({
            irImageLabel: !isEmpty(d.irPhoto) ? `${d.irPhoto}${d.type.value}` : null,
            visualImageLabel: !isEmpty(d.visualPhoto) ? `${d.visualPhoto}${d.type.value}` : null,
            woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
            irwoimagelabelmappingId: get(d, 'irwoimagelabelmappingId', null),
            isDeleted: get(d, 'isDeleted', false),
            manualWoNumber: d.s3ImageFolderName ? d.s3ImageFolderName : workOrderNumber,
          }))
      payload.obIrImageLabelList = images
    }
    if (isNew) payload.woId = workOrderID
    //multi parent mapping
    const fedByMapping = []
    const fedBys = []
    fedByList.forEach(d => {
      if (!isEmpty(d.fedBy)) fedBys.push(d)
    })
    const old = get(viewObj, 'woObAssetFedByMapping', [])
    if (!isEmpty(fedBys) || !isEmpty(old)) {
      fedBys.forEach(d => {
        const fedByJson = JSON.parse(get(d, 'fedbyDetailsJson', '{}'))
        const conductorLabels = fedByJson.conductors
          .map(conductor => {
            const materialLabel = conductor.material === 'Copper' ? 'Cu' : 'Al'
            return `${conductor.amount}x ${materialLabel} ${conductor.size}`
          })
          .join(', ')
        const obj = old.find(x => x.parentAssetId === d.fedBy.value)
        fedByMapping.push({
          woObAssetFedById: get(obj, 'woObAssetFedById', null),
          parentAssetId: d.fedBy.value,
          isParentFromObWo: !!d.fedBy.isOB,
          woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
          isDeleted: false,
          // fedByUsageTypeId: d.type,
          // length: get(d, 'length', ''),
          // style: get(d, 'style', ''),
          // conductorTypeId: get(d, 'conductorType.value', 0),
          // numberOfConductor: parseInt(get(d, 'conductorName', 0)),
          // racewayTypeId: get(d, 'racewayType.value', 0),
          viaSubcomponantAssetId: d?.subComponentAsset?.isTemp === false ? get(d, 'subComponentAsset.sublevelcomponentAssetId', null) : null,
          viaSubcomponantAssetName: get(d, 'subComponentAsset.name', ''),
          viaSubcomponantAssetClassCode: get(d, 'subComponentAsset.classData.className', ''),
          fedByViaSubcomponantAssetId: get(d, 'ocp.value', null),
          isViaSubcomponantAssetFromObWo: get(d, 'subComponentAsset.isSublevelcomponentFromObWo', true),
          isFedByViaSubcomponantAssetFromObWo: !isEmpty(d.ocp?.woonboardingassetsId) ? true : false,
          fedbyDetailsJson: get(d, 'fedbyDetailsJson', null),
          label: `${fedByJson.sets} Parallel Sets ${fedByJson.diameter}" ${fedByJson.material} ${fedByJson.length}' ${conductorLabels}`,
        })
      })
      const deleted = differenceBy(old, fedByMapping, 'parentAssetId')
      deleted.forEach(d => fedByMapping.push({ ...d, isDeleted: true }))
    }
    payload.woObAssetFedByMapping = fedByMapping
    payload.inspectionType = enums.MWO_INSPECTION_TYPES.ONBOARDING
    // component mapping
    payload.componentLevelTypeId = componentType
    // sub component mapping
    const subComponentMappings = []
    if (!isEmpty(subComponentList) || !isEmpty(get(viewObj, 'woObAssetSublevelcomponentMapping', []))) {
      subComponentList.forEach(sub => {
        subComponentMappings.push({
          wolineSublevelcomponentMappingId: get(sub, 'wolineSublevelcomponentMappingId', null),
          woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null),
          sublevelcomponentAssetId: get(sub, 'sublevelcomponentAssetId', null),
          isSublevelcomponentFromObWo: get(sub, 'isSublevelcomponentFromObWo', true),
          isDeleted: false,
          sublevelcomponentAssetName: sub.name,
          sublevelcomponentAssetClassId: get(sub, 'classData.id', null),
          circuit: sub.circuit,
          lineLoadSideId: get(sub, 'classData.is_line_load_side_allowed', false) === true ? get(sub, 'lineLoadSideId', null) : null,
          subcomponentImageList: get(sub, 'subcomponentImageList', []),
        })
      })
      const deletedSubComponents = differenceBy(get(viewObj, 'woObAssetSublevelcomponentMapping', []), subComponentMappings, 'wolineSublevelcomponentMappingId')
      deletedSubComponents.forEach(d => subComponentMappings.push({ ...d, isDeleted: true }))
    }
    payload.woObAssetSublevelcomponentMapping = isTopLevelComponent ? (get(assetClassCode, 'is_allowed_subcomponent', false) === true ? subComponentMappings : []) : []
    // top level mapping
    const topLevelMappings = []
    const oldTopLevelMappingIds = []
    get(viewObj, 'woObAssetToplevelcomponentMapping', []).forEach(d => {
      oldTopLevelMappingIds.push(d.toplevelcomponentAssetId)
      if (d.toplevelcomponentAssetId !== get(topLevelComponent, 'value', '')) topLevelMappings.push({ ...d, isDeleted: true })
      else topLevelMappings.push(d)
    })
    if (!isEmpty(topLevelComponent) && !oldTopLevelMappingIds.includes(get(topLevelComponent, 'value', ''))) {
      topLevelMappings.push({ wolineToplevelcomponentMappingId: null, woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null), toplevelcomponentAssetId: get(topLevelComponent, 'value', null), isToplevelcomponentFromObWo: !!get(topLevelComponent, 'isOB', false), isDeleted: false })
    }
    payload.woObAssetToplevelcomponentMapping = isTopLevelComponent ? [] : topLevelMappings
    // locations
    payload.tempMasterBuildingId = get(payload, 'building.tempMasterBuildingId', null)
    payload.tempMasterFloorId = get(payload, 'floor.tempMasterFloorId', null)
    payload.tempMasterRoomId = get(payload, 'room.tempMasterRoomId', null)
    payload.building = isInstalling ? get(asset, 'building', null) : get(payload, 'building.label', null)
    payload.floor = isInstalling ? get(asset, 'floor', null) : get(payload, 'floor.label', null)
    payload.room = isInstalling ? get(asset, 'room', null) : get(payload, 'room.label', null)
    payload.tempBuilding = get(payload, 'building', null)
    payload.tempFloor = get(payload, 'floor', null)
    payload.tempRoom = get(payload, 'room', null)
    payload.tempSection = get(asset, 'section', null)
    payload.tempMasterBuilding = isInstalling ? get(asset, 'building', null) : get(payload, 'building', null)
    payload.tempMasterFloor = isInstalling ? get(asset, 'floor', null) : get(payload, 'floor', null)
    payload.tempMasterRoom = isInstalling ? get(asset, 'room', null) : get(payload, 'room', null)
    payload.tempMasterSection = get(asset, 'section', null)

    //Estimate
    const pmEstimatePayload = []
    if (!isEmpty(estimateData.pmEstimationList)) {
      get(estimateData, 'pmEstimationList', []).forEach(d =>
        pmEstimatePayload.push({
          pmId: get(d, 'pmId', null),
          estimationTime: Number(get(d, 'estimationTime', null)),
          isDeleted: false,
          sitewalkthroughTempPmEstimationId: get(d, 'sitewalkthroughTempPmEstimationId', null),
        })
      )
    }
    payload.pmPlanId = get(estimateData, 'pmPlanId', null)
    payload.pmEstimationData = pmEstimatePayload

    const multiIssuelistPlayload = []
    if (!isEmpty(multiIssueList)) {
      multiIssueList.forEach(d => {
        const issueImageList = get(d, 'issueImageList', [])
        const updatedIssueImageList = [...issueImageList]
        if (!isEmpty(d.selectedChips)) {
          d.selectedChips.forEach(item => {
            const { irPhoto, visualPhoto, irwoimagelabelmappingId, isDeleted } = item.value

            const existingItemIndex = updatedIssueImageList.findIndex(d => d.irwoimagelabelmappingId === irwoimagelabelmappingId)

            if (existingItemIndex !== -1 && irwoimagelabelmappingId !== null) {
              updatedIssueImageList[existingItemIndex] = {
                ...updatedIssueImageList[existingItemIndex],
                imageDurationTypeId: 3,
                assetPhotoType: 3,
                assetPhoto: null,
                assetThumbnailPhoto: null,
                isDeleted: isDeleted ?? updatedIssueImageList[existingItemIndex].isDeleted,
              }
            } else {
              const newItem =
                irwoimagelabelmappingId === null
                  ? {
                      irwoimagelabelmappingId: null,
                      imageDurationTypeId: 3,
                      assetPhotoType: 3,
                      isDeleted: false,
                      assetPhoto: isEmpty(irPhoto) ? null : irPhoto,
                      assetThumbnailPhoto: isEmpty(visualPhoto) ? null : visualPhoto,
                    }
                  : {
                      irwoimagelabelmappingId: irwoimagelabelmappingId,
                      assetPhoto: null,
                      assetThumbnailPhoto: null,
                      assetPhotoType: 3,
                      imageDurationTypeId: 3,
                      isDeleted: isDeleted,
                    }

              updatedIssueImageList.push(newItem)
            }
          })
        }

        multiIssuelistPlayload.push({
          isIssueLinkedForFix: get(d, 'isIssueLinkedForFix.value', false),
          issueDescription: get(d, 'issueDescription', ''),
          issueTitle: get(d, 'issueTitle', ''),
          issueType: get(d, 'issueType', null),
          necViolation: get(d, 'necViolation.value', null),
          oshaViolation: get(d, 'oshaViolation.value', null),
          nfpa70BViolation: get(d, 'nfpa70BViolation.value', null),
          thermalAnomalyAdditionalIrPhoto: get(d, 'thermalAnomalyAdditionalIrPhoto', null),
          thermalAnomalyLocation: get(d, 'thermalAnomalyLocation', null),
          thermalAnomalyMeasuredAmps: isEmpty(get(d, 'thermalAnomalyMeasuredAmps', null)) ? null : get(d, 'thermalAnomalyMeasuredAmps', null)?.toString(),
          thermalAnomalyMeasuredTemps: get(d, 'thermalAnomalyMeasuredTemps', null),
          thermalAnomalyProblemDescription: get(d, 'thermalAnomalyProblemDescription', null),
          thermalAnomalyCorrectiveAction: get(d, 'thermalAnomalyCorrectiveAction', null),
          thermalAnomalyRefrenceTemps: get(d, 'thermalAnomalyRefrenceTemps', null),
          thermalAnomalySubComponant: get(d, 'thermalAnomalySubComponant.value', null),
          thermalClassificationId: get(d, 'thermalClassification.value', null),
          woLineIssueId: get(d, 'woLineIssueId', null),
          issueImageList: updatedIssueImageList,
          isDeleted: get(d, 'isDeleted', false),
          typeOfUltrasonicAnamoly: get(d, 'typeOfUltrasonicAnamoly.value', null),
          locationOfUltrasonicAnamoly: get(d, 'locationOfUltrasonicAnamoly', ''),
          sizeOfUltrasonicAnamoly: get(d, 'sizeOfUltrasonicAnamoly', ''),
          dynamicFieldJson: isEmpty(get(d, 'dynamicFieldJson', '')) ? null : JSON.stringify(get(d, 'dynamicFieldJson', null)),
          issueCausedId: get(d, 'issueCausedId', null),
          thermalAnomalySeverityCriteria: get(d, 'thermalAnomalySeverityCriteria', null),
          isAbcPhaseRequiredForReport: get(d, 'isAbcPhaseRequiredForReport', false),
          selectedChips: get(d, 'selectedChips', []),
        })
      })
    }
    payload.wolineIssueList = multiIssuelistPlayload
    //
    let createdAsset
    setIsSaving(status)
    try {
      let newPayload = JSON.stringify(snakifyKeys(payload))
      newPayload = newPayload.replaceAll('nfpa_70_b_violation', 'nfpa_70b_violation')
      const res = await onBoardingWorkorder.updateAssetDetails(newPayload)
      if (res.success > 0) {
        createdAsset = res.data
        Toast.success(`Asset ${isNew ? 'Added' : 'Updated'} Successfully !`)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error uploading Asset. Please try again !`)
    }
    setIsSaving('')
    closeForm()
    const tempAsset = isInstalling ? { ...createdAsset, classId: assetClassCode.id } : lineObj
    afterSubmit(tempAsset)
  }
  const closeForm = async () => {
    onClose()
    if (isNewFedByCreated) afterSubmit(lineObj)
    const fileName = uploadedImages.filter(d => d.isDeleted).map(d => d.assetPhoto)
    if (!isEmpty(fileName)) {
      try {
        await deleteBucketObject(snakifyKeys({ fileName, bucketType: 1 }))
      } catch (error) {}
    }
  }
  const handleQrUpload = () => {
    uploadQrRef.current && uploadQrRef.current.click()
  }
  const uploadQR = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else {
        processQR(file)
      }
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }
  const processQR = async file => {
    const formData = new FormData()
    formData.append('file', file)
    setQRUploading(true)
    try {
      const res = await uploadQrCodeImage(formData)
      const qrData = get(res, 'data[0].symbol[0]', {})
      if (!qrData.data) Toast.error('Could not find/read QR code !')
      else handleInputChange('qrCode', qrData.data)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setQRUploading(false)
  }
  const handleClassCodeChange = v => {
    setClassCode(v)
    handleInputChange('assetClassName', get(v, 'className', ''))
  }
  const updateFieldCount = (isAdd, index) => {
    if (isAdd) {
      setMultipleFields(p => [...p, { isDeleted: false }])
      setIrCount(prev => prev + 1)
      setVirPhotoNum(p => [...p, { irPhoto: `FLIR-${irCount + 1}`, visualPhoto: `FLIR-${irCount + 1}-visual`, type: imageTypeOptions[0], isDeleted: false, id: nanoid(), irwoimagelabelmappingId: null }])
    } else {
      const arr = [...multipleFields]
      arr[index]['isDeleted'] = true
      const nums = [...virPhotoNum]
      nums[index].isDeleted = true
      setVirPhotoNum(nums)
      setMultipleFields(arr)
    }
  }
  const handlePhotoNumChange = (name, index, value) => {
    const data = [...virPhotoNum]
    data[index][name] = value

    if (photosType.cameraType === enums.CAMERA_TYPE.FLUKE || photosType.imageType === enums.PHOTO_TYPE.IR_ONLY) {
      if (name === 'irPhoto') {
        data[index]['visualPhoto'] = isEmpty(value) ? '' : `${value}-visual`
      }
    }

    if (value === 'type') {
      data[index]['type'] = name
    }

    setVirPhotoNum(data)
  }
  const handleTypeFocus = index => {
    const images = [...photoNoTypeErrorIndexes]
    images[index] = false
    setPhotoNoTypeErrorIndexes(images)
  }
  //
  const changeSection = section => {
    setActiveSectionName(section)
    const id = section.toLowerCase().split(' ').join('-')
    const scrolledElm = document.querySelector(`#${id}`)
    scrolledElm.scrollIntoView({ behavior: 'smooth' })
    scrolledElm.childNodes[0].style.borderColor = '#778798'
    scrolledElm.childNodes[0].style.boxShadow = '0 0 4px #778798'
    setTimeout(() => {
      scrolledElm.childNodes[0].style.borderColor = '#dee2e6'
      scrolledElm.childNodes[0].style.boxShadow = 'none'
    }, 1000)
  }
  const handleScroll = () => {
    const pos = scrollableDiv.current.scrollTop
    const ids = formSectionNames.map(d => d.toLowerCase().split(' ').join('-'))
    ids.forEach(id => {
      const target = document.querySelector(`#${id}`)
      if (target) {
        const offSetTop = target.offsetTop - 180
        if (offSetTop && pos >= offSetTop) {
          const title = ['sub-components'].includes(id) ? id.toUpperCase() : id.toUpperCase().split('-').join(' ')
          setActiveSectionName(title)
        }
      }
    })
  }
  // nameplate info
  useEffect(() => {
    if (!isEmpty(assetClassCode)) {
      ;(async () => {
        try {
          setNameplateInfoLoading(true)
          $('#pageLoading').show()
          const res = await assetClass.nameplateInfo.get({ id: assetClassCode.id })
          const data = JSON.parse(get(res, `data.formNameplateInfo`, '{}'))
          const updated = isAddingExisting ? JSON.parse(get(viewObj, `formRetrivedNameplateInfo`, '{}')) : JSON.parse(get(viewObj, `formNameplateInfo`, '{}'))
          if (!isEmpty(updated)) {
            Object.keys(data).forEach(d => {
              const value = isEmpty(get(updated[d], ['value'], '')) ? updated[d] : updated[d]['value']
              if (data[d]['type'] === 'select') {
                data[d]['value'] = updated[d]
              } else {
                data[d]['value'] = value || data[d]['value']
              }
            })
          } else {
            Object.keys(data).forEach(d => {
              if (data[d]['type'] === 'select') {
                data[d]['value'] = data[d]['value']?.label
              }
            })
          }
          setNameplateInformation(data)
          setNameplateInfoLoading(false)
          $('#pageLoading').hide()
        } catch (error) {
          setNameplateInfoLoading(false)
          $('#pageLoading').hide()
          console.log(error)
        }
      })()
      // MT Estimate
      ;(async () => {
        try {
          setNameplateInfoLoading(true)
          $('#pageLoading').show()
          const estimate = await assetClass.maintenanceEstimate.get({ classId: assetClassCode.id, woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null) })
          if (estimate.success > 0) {
            setEstimateData(get(estimate, 'data', null))
          } else {
            console.log(get(estimate, 'message', ''))
          }
        } catch (error) {
          $('#pageLoading').hide()
          console.log(error)
        }
      })()
    } else setNameplateInformation({})
  }, [assetClassCode])

  const handleChange = (key, value) => {
    const data = { ...nameplateInformation }
    if (data.hasOwnProperty(key)) {
      if (typeof data[key] !== 'object' || data[key] === null) {
        data[key] = {}
      }
      data[key]['value'] = value
      setNameplateInformation(data)
    }
  }

  // handle components
  const handleAddSubComponent = () => {
    const subComponent = { name: '', classData: null, error: { name: null, classData: null }, circuit: '', npPhoto: {}, id: subComponentList.length + 1, subcomponentImageList: [], isTemp: true, lineLoadSideId: null }
    setSubComponentList([...subComponentList, subComponent])
  }
  const handleComponentRowChange = (name, value, id) => {
    const list = [...subComponentList]
    const current = list.find(d => d.id === id)
    current[name] = value
    if (name === 'classData') {
      if (get(value, 'is_line_load_side_allowed', false) === true) {
        current['lineLoadSideId'] = enums.SUB_COMPONENT_TYPE.LOAD_SIDE
      }
    }
    setSubComponentList(list)
  }
  const handleRemoveComponentRow = id => {
    let list = [...subComponentList]
    list = list.filter(component => component.id !== id)
    const newList = list.map((d, index) => ({ ...d, id: index + 1 }))
    setSubComponentList(newList)

    // handle ocp
    const removeSub = subComponentList.find(component => component.id === id)
    if (removeSub) {
      const updatedFedByList = fedByList.map(val => {
        if (val.subComponentAsset?.name === removeSub.name) {
          return {
            ...val,
            subComponentAsset: [],
          }
        }
        return val
      })
      setFedByList(updatedFedByList)
      setSubComponentAsset([])
    }
  }
  const handleSubComponentPhoto = item => {
    // uploadSubComponentPhotoRef.current[index].current && uploadSubComponentPhotoRef.current[index].current.click()
    setSubComponentPhotoInfo(item)
    setSubComponentPopupOpen(true)
  }
  const handleSubComponentPhotoUpload = (e, id) => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(extension)) Toast.error('Invalid Image format !')
      else {
        setSubComponentPhotoInfo({ id, file })
        setSubComponentPopupOpen(true)
      }
    }
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    e.target.value = null
  }
  const keepPhoto = ({ data, id }) => {
    handleComponentRowChange('subcomponentImageList', data, id)
    setTimeout(() => setSubComponentPopupOpen(false), 500)
  }
  const handleErrorSubComponent = (name, id) => {
    const list = [...subComponentList]
    const current = list.find(d => d.id === id)
    current['error'][name] = null
    setSubComponentList(list)
  }
  const handleSubComponentPhotoClick = (file, id) => {
    setSubComponentPhotoInfo({ id, file })
    setSubComponentPopupOpen(true)
  }
  useEffect(() => {
    if (!isEmpty(topLevelComponentOptions)) {
      const opt = topLevelComponentOptions.find(d => d.value === get(viewObj, 'woObAssetToplevelcomponentMapping[0].toplevelcomponentAssetId', ''))
      setTopLevelComponent(opt)
    }
  }, [topLevelComponentOptions])

  // handle fed by
  const handleRemoveFedBy = id => {
    let updatedFedBytList = [...fedByList]
    const removeFedBy = updatedFedBytList.filter(val => val.id === id)

    updatedFedBytList = updatedFedBytList.filter(component => component.id !== id)
    const newList = updatedFedBytList.map((d, index) => ({
      ...d,
      id: index + 1,
    }))
    setFedByList(newList)

    const newArrayList = includedFedBy.filter(val => val !== removeFedBy[0].fedBy.value)
    setIncludedFedBy(newArrayList)
  }
  const handleAddFedBy = value => {
    if (fedByList.map(d => d.fedBy.label).includes(value.label)) return
    const updatedFedBy = [...fedByList]
    updatedFedBy.push({ fedBy: value, type: fedByTypeOptions[0]['value'], id: fedByList.length + 1, length: '', style: '' })
    setFedByList(updatedFedBy)
  }
  const handleFedByTypeChange = (id, value) => {
    const updatedFedBy = [...fedByList]
    const currentFedBy = updatedFedBy.find(d => d.id === id)
    currentFedBy['type'] = value
    setFedByList(updatedFedBy)
  }
  const handleFedByOptionsChange = (id, value, key) => {
    const updatedFedBy = [...fedByList]
    const currentFedBy = updatedFedBy.find(d => d.id === id)
    currentFedBy[key] = value
    setFedByList(updatedFedBy)
  }
  const handleFedByStyleLengthChange = (id, value, key) => {
    const updatedFedBy = [...fedByList]
    const currentFedBy = updatedFedBy.find(d => d.id === id)
    currentFedBy[key] = value
    setFedByList(updatedFedBy)
  }
  const createFedBy = async id => {
    try {
      setFedByLoading(true)
      $('#pageLoading').show()
      const assetNameOpts = await onBoardingWorkorder.fedBy.topSubHiararchy({ id: workOrderID })
      const mainList = get(assetNameOpts, 'data.toplevelMainAssets', []) || []
      const obList = get(assetNameOpts, 'data.toplevelObwoAssets', []) || []
      const mainOpts = mainList.map(asset => ({ ...asset, label: asset.assetName, value: asset.assetId }))
      const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
      const options = [...mainOpts, ...obOpts]
      setFedByOptions(options)
      const fed = options.find(d => d.value === id)
      const updatedFedBy = [...fedByList]
      const mainSub = get(assetNameOpts, 'data.subcomponentMainAssets', []) || []
      const obSub = get(assetNameOpts, 'data.subcomponentObwoAssets', []) || []
      const mainSubOpts = mainSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.assetId }))
      const obSubOpts = obSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.woonboardingassetsId }))
      const subOptions = [...mainSubOpts, ...obSubOpts]
      setMainSubOptions(subOptions)
      const selectOcp = subOptions.filter(val => val.toplevelcomponentAssetId === id)
      const fedJson = {
        type: connectionType.find(d => d.value === connectType).label,
        material: connectType === 3 || connectType === 4 ? '' : materialNonFlexType.find(d => d.value === material)?.label,
        diameter: diaMeter,
        length: length,
        sets: sets,
        conductors: conductorJson.map(d => ({
          amount: d.amount,
          material: d.material,
          size: d.size.value,
        })),
      }
      const conductorLabels = fedJson.conductors
        .map(conductor => {
          const materialLabel = conductor.material === 'Copper' ? 'Cu' : 'Al'
          return `${conductor.amount}x ${materialLabel} ${conductor.size}`
        })
        .join(', ')

      fedJson['label'] = `${fedJson.sets} Parallel Sets ${fedJson.diameter}" ${fedJson.material} ${fedJson.length}' ${conductorLabels}`
      updatedFedBy.push({ fedBy: { ...fed, name: fed.assetName }, id: fedByList.length + 1, ocp: selectOcp[0], subComponentAsset, fedbyDetailsJson: JSON.stringify(fedJson) })
      setFedByList(updatedFedBy)
      setNewFedByCreated(true)
      setIncludedFedBy([...includedFedBy, fed.value])
      // const ocp = orderBy(
      //   subComponentList
      //     .filter(val => !isEmpty(val?.name) && !isEmpty(val?.classData))
      //     .map(d => ({ label: get(d, 'name', '') || '', value: d?.isTemp === true ? nanoid() : get(d, 'sublevelcomponentAssetId', null), classCode: get(d, 'classData.label', '') || '', isSublevelcomponentFromObWo: get(d, 'isSublevelcomponentFromObWo', true), isTemp: d?.isTemp === true ? true : false || false })),
      //   [e => e.label && e.label.toLowerCase()],
      //   ['asc']
      // )

      // setAssetSubComponentOptions(ocp)
    } catch (error) {
      setFedByOptions([])
    }
    setFedByLoading(false)
    $('#pageLoading').hide()
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const rejectAsset = async () => {
    const payload = { taskRejectedNotes: reason, status: enums.woTaskStatus.Reject, woonboardingassetsId: viewObj.woonboardingassetsId }
    setRejectLoading(true)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Rejected Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting asset. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    afterSubmit(lineObj)
    onClose()
    setReason('')
  }
  // locations
  const handleBuildingChange = building => {
    const floorOpts = get(building, 'tempMasterFloor', []).map(d => ({ ...d, label: d.floorName, value: d.floorName, actualId: d.tempMasterFloorId }))
    setFloorOptions(floorOpts)
    setRoomOptions([])
    setAsset({ ...asset, building, floor: null, room: null })
  }
  const handleFloorChange = floor => {
    const roomOpts = get(floor, 'tempMasterRooms', [])?.map(d => ({ ...d, label: d.roomName, value: d.roomName, actualId: d.tempMasterRoomId }))
    setRoomOptions(roomOpts)
    setAsset({ ...asset, floor, room: null })
  }
  const setLocationAsDefaultForOrphanSubLevelAsset = () => {
    if (isInstalling) {
      setAsset({ ...asset, building: 'Default', floor: 'Default', room: 'Default' })
    } else {
      const building = buildingOptions.find(d => d.label === 'Default')
      const floorOpts = get(building, 'tempMasterFloor', []).map(d => ({ ...d, label: d.floorName, value: d.tempMasterFloorId }))
      const floor = floorOpts.find(d => d.label === 'Default')
      const roomOpts = get(floor, 'tempMasterRooms', []).map(d => ({ ...d, label: d.roomName, value: d.tempMasterRoomId }))
      const room = roomOpts.find(d => d.label === 'Default')
      setRoomOptions(roomOpts)
      setFloorOptions(floorOpts)
      setAsset({ ...asset, building, floor, room })
    }
  }
  const inheritTopLevelLocations = d => {
    if (!isInstalling) {
      const building = { label: d.buildingName, value: 'inherited-building' }
      const floor = { label: d.floorName, value: 'inherited-floor' }
      const room = { label: d.roomName, value: 'inherited-room' }
      setBuildingOptions([...buildingOptions, building])
      setFloorOptions([...floorOptions, floor])
      setRoomOptions([...roomOptions, room])
      setAsset({ ...asset, building, floor, room })
    } else {
      const building = d.buildingName
      const floor = d.floorName
      const room = d.roomName
      setAsset({ ...asset, building, floor, room })
    }
  }
  const handleChangeInSelectedTopLevelComponent = d => {
    setTopLevelComponent(d)
    if (isEmpty(d)) setLocationAsDefaultForOrphanSubLevelAsset()
    else inheritTopLevelLocations(d)
  }
  // photos
  const renderAssetImages = (imageList, type, duration, issueID) => {
    const filteredImageList = imageList
      ?.filter(d => d.assetPhotoType === type && (d.imageDurationTypeId === duration || d.imageDurationTypeId === null))
      ?.map((d, index) => !d.isDeleted && { ...d, index })
      .filter(Boolean)

    return filteredImageList.map((d, index) => (
      <AssetImage
        onClick={() => {
          setPreview([true, type])
          setImageOrder(index)
          setIssueImageList(issueID ? filteredImageList : [])
        }}
        onRemove={() => removeImage(d, issueID)}
        key={`asset-image-${d.assetPhoto}`}
        url={`${d.url}?value=${randomValue}`}
        randomValue={randomValue}
      />
    ))
  }
  const PhotosSection = ({ label, type, duration = 0, multiIssueID = 0 }) => {
    const key = `${type}_${duration}_${multiIssueID}`
    const handleClick = () => {
      setMultiIssuePhotosId(multiIssueID)
    }
    return (
      <>
        <div className='d-flex justify-content-between'>
          <div className='text-bold mr-3 mt-2'>{label}</div>
          <AssetImageUploadButton
            loading={isPhotoUploading[key] && uploadingPhotoType.duration === duration}
            disabled={isPhotoUploading[key]}
            onClick={() => {
              handleUpload({ type, duration, multiIssueID })
              handleClick()
            }}
          />
        </div>

        {photoError[key] && <span style={{ fontWeight: 800, color: 'red', margin: '5px 0' }}>{photoError[key]}</span>}
        {!isEmpty(uploadedImages.filter(d => d.assetPhotoType === type)) && (
          <div className='py-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
            {renderAssetImages(uploadedImages, type, duration)}
          </div>
        )}

        {multiIssueList
          .filter(m => m.id === multiIssueID)
          .flatMap(v => {
            const issueImage = v.issueImageList.filter(d => d.assetPhotoType === type && d.imageDurationTypeId === duration)
            return (
              <>
                {!isEmpty(issueImage) && (
                  <div className='py-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                    {renderAssetImages(v.issueImageList, type, duration, v.id)}
                  </div>
                )}
              </>
            )
          })}
      </>
    )
  }
  // fedby
  const handleTopAsset = topAsset => {
    setTopLevelAsset([topAsset])
    if (isEmpty(topAsset)) {
      setSubComponentAssetOptions(get(topSubLevlHiararchy, 'subComponentAsset', []))
      setMainSubOptions(get(topSubLevlHiararchy, 'subComponentAsset', []))
    } else {
      const subMapping = get(topSubLevlHiararchy, 'subComponentAsset', [])?.filter(val => val.toplevelcomponentAssetId === topAsset.value)
      setSubComponentAssetOptions(subMapping)
      setMainSubOptions(get(topSubLevlHiararchy, 'subComponentAsset', []))
    }
  }
  const handleSubAsset = subAsset => {
    setSubLevelAsset(subAsset)
    if (isEmpty(subAsset)) {
      setTopComponentAssetOptions(get(topSubLevlHiararchy, 'topComponentAsset', []))
    } else {
      const topLevel = topComponentAssetOptions?.filter(val => val.value === subAsset.toplevelcomponentAssetId)
      setTopComponentAssetOptions(topLevel)
      setTopLevelAsset(topLevel)
    }
  }
  const handleExistingFedBy = () => {
    // if (fedByList.map(d => d.fedBy.label).includes(topLevelAsset.label)) return
    const updatedFedBy = [...fedByList]
    const fedJson = {
      type: connectionType.find(d => d.value === connectType).label,
      material: connectType === 3 || connectType === 4 ? '' : materialNonFlexType.find(d => d.value === material)?.label,
      diameter: diaMeter,
      length: length,
      sets: sets,
      conductors: conductorJson.map(d => ({
        amount: d.amount,
        material: d.material,
        size: d.size.value,
      })),
    }
    const conductorLabels = fedJson.conductors
      .map(conductor => {
        const materialLabel = conductor.material === 'Copper' ? 'Cu' : 'Al'
        return `${conductor.amount}x ${materialLabel} ${conductor.size}`
      })
      .join(', ')

    fedJson['label'] = `${fedJson.sets} Parallel Sets ${fedJson.diameter}" ${fedJson.material} ${fedJson.length}' ${conductorLabels}`

    if (isExistingFedByOpen[1]) {
      const currectFed = updatedFedBy.find(d => d.id === isExistingFedByOpen[2])
      currectFed.fedbyDetailsJson = JSON.stringify(fedJson)
      currectFed.ocp = subLevelAsset
      currectFed.subComponentAsset = subComponentAsset
      setFedByList(updatedFedBy)
    } else {
      updatedFedBy.push({ fedBy: topLevelAsset[0], id: fedByList.length + 1, ocp: subLevelAsset, subComponentAsset, fedbyDetailsJson: JSON.stringify(fedJson) })
      setFedByList(updatedFedBy)
    }

    setIncludedFedBy([...includedFedBy, topLevelAsset[0].value])
    handleCloseFedBy()
  }
  const handleSelectOptions = topId => {
    const subOptions = mainSubOtions.filter(val => val.toplevelcomponentAssetId === topId)
    return filter(subOptions, item => item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE)
  }

  const handleCloseFedBy = () => {
    setExistingFedByOpen([false, false, null])
    setTopLevelAsset([])
    setSubLevelAsset([])
    setFedByType(1)
    setConductorLength('')
    setConductorName('')
    setConductorSize('')
    setRacewayType([])
    setConductorType([])
    handleSubAsset()
    handleTopAsset()
    setConductorJson([{ amount: 1, material: 'Copper', size: conductorSizeOptions[0], id: 0 }])
    setDiaMeter(1)
    setLength(50)
    setSets(1)
    setConnectType(connectionType[0].value)
    setMaterial(materialNonFlexType[0].value)
  }
  // image details textreact
  const textRactApi = async image => {
    setIsOpenCircuitView(false)
    setImageDrawerLoading(true)
    try {
      const url = new URL(image.url)
      const pathSegments = url.href.split('/')
      const bucketName = pathSegments[isEmpty(pathSegments[3]) ? 4 : 3]
      const imageName = pathSegments[pathSegments.length - 1]

      const payload = {
        bucket_name: bucketName,
        image_name: imageName,
        inspectiontemplate_asset_class_id: !isEmpty(assetClassCode) ? assetClassCode.id : null,
      }
      const res = await onBoardingWorkorder.textRact(payload)
      if (res.success === 1) {
        const data = JSON.parse(get(res, 'data.textractOutputJson', ''))
        const extractedJson = data.Blocks.map(d => ({
          blockType: get(d, 'BlockType', ''),
          // boundingBox: get(d, 'Geometry.BoundingBox', ''),
          // confidence: get(d, 'Confidence', ''),
          text: get(d, 'Text', ''),
          query: get(d, 'Query', ''),
          relationships: get(d, 'Relationships', []),
          id: get(d, 'Id', ''),
        }))
        setExtractedJson(extractedJson)
        image.imageExtractedJson = JSON.stringify(extractedJson)
        setImageDrawerLoading(false)
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      setImageDrawerLoading(false)
    }
  }

  // const handleImageDetails = async image => {
  //   setImageObject(image)
  //   setOpenImageDrawer(true)
  //   setImageDrawerLoading(true)
  //   setImagePreviewUrl(image.url)

  //   if (image.assetPhotoType === photoTypes.nameplate) {
  //     if (!isEmpty(image.imageExtractedJson)) {
  //       setExtractedJson(JSON.parse(image.imageExtractedJson))
  //       setImageDrawerLoading(false)
  //     } else {
  //       textRactApi(image)
  //     }
  //   }
  // }

  // useEffect(() => {
  //   const questions = extractedJson.filter(block => block.blockType.Value === 'QUERY')
  //   const answers = extractedJson.filter(block => block.blockType.Value === 'QUERY_RESULT')

  //   const questionAnswerPairs = questions.map(question => {
  //     const answerId = question?.relationships[0]?.Ids.map(id => id)
  //     const answer = answers?.find(ans => answerId?.includes(ans?.id))

  //     return {
  //       question: question.query.Text,
  //       answer: answer ? answer.text : '',
  //       id: Math.random(),
  //     }
  //   })
  //   setQuestions(questionAnswerPairs)
  // }, [extractedJson])

  // copy text
  // const handleCopyText = text => {
  //   setCopied(true)
  //   navigator.clipboard.writeText(text)
  // }

  const handleOpenFedBy = () => {
    // const ocp = orderBy(
    //   subComponentList
    //     .filter(val => !isEmpty(val?.name) && !isEmpty(val?.classData))
    //     .map(d => ({ label: get(d, 'name', '') || '', value: d?.isTemp === true ? nanoid() : get(d, 'sublevelcomponentAssetId', null), classCode: get(d, 'classData.label', '') || '', isSublevelcomponentFromObWo: get(d, 'isSublevelcomponentFromObWo', true), isTemp: d?.isTemp === true ? true : false || false })),
    //   [e => e.label && e.label.toLowerCase()],
    //   ['asc']
    // )

    // setAssetSubComponentOptions(ocp)
    setExistingFedByOpen([true, false, null])
  }

  const maxLengthCheck = object => {
    if (object.target.value.length > object.target.maxLength) {
      object.target.value = object.target.value.slice(0, object.target.maxLength)
    }
  }

  // useEffect(() => {
  //   const ocp = orderBy(
  //     subComponentList
  //       .filter(val => !isEmpty(val?.name) && !isEmpty(val?.classData))
  //       .map(d => ({ label: get(d, 'name', '') || '', value: d?.isTemp === true ? nanoid() : get(d, 'sublevelcomponentAssetId', null), classCode: get(d, 'classData.label', '') || '', isSublevelcomponentFromObWo: get(d, 'isSublevelcomponentFromObWo', true), isTemp: d?.isTemp === true ? true : false || false })),
  //     [e => e.label && e.label.toLowerCase()],
  //     ['asc']
  //   )

  //   setAssetSubComponentOptions(ocp)
  // }, [subComponentList])

  useEffect(() => {
    const irImgList = orderBy(
      virPhotoNum.filter(val => (!isEmpty(val?.irPhoto) || !isEmpty(val?.visualPhoto)) && !val.isDeleted).map(d => ({ label: handleChipLable(d) || '', value: d, id: d.id ? d.id : nanoid() })),
      ['asc']
    )
    setIrPhotoOptions(irImgList)

    if (!isEmpty(multiIssueList)) {
      const list = [...multiIssueList]
      if (!isEmpty(list)) {
        list.forEach(d => {
          if (d.selectedChips) {
            const updatedChips = d.selectedChips.filter(chip => {
              const matchingItem = virPhotoNum.find(photo => photo.id === chip.id)
              return !matchingItem || (!matchingItem.isDeleted && (!isEmpty(matchingItem?.irPhoto) || !isEmpty(matchingItem?.visualPhoto)))
            })
            d.selectedChips = updatedChips
          }
        })
      }
      setMultiIssueList(list)
    }

    if (viewObj && !selectedChipRef.current) {
      if (!isEmpty(multiIssueList)) {
        const list = [...multiIssueList]
        list.forEach(d => {
          const issueImageList = get(d, 'issueImageList', [])
          if (!isEmpty(issueImageList) && !isEmpty(virPhotoNum)) {
            issueImageList.forEach(issueImage => {
              virPhotoNum.forEach(virPhoto => {
                if (virPhoto.irwoimagelabelmappingId === issueImage.irwoimagelabelmappingId) {
                  if (!virPhoto.isDeleted && (!isEmpty(virPhoto?.irPhoto) || !isEmpty(virPhoto?.visualPhoto))) {
                    const data = {
                      label: handleChipLable(virPhoto),
                      id: virPhoto.id ? virPhoto.id : nanoid(),
                      value: virPhoto,
                    }
                    d.selectedChips = [...d.selectedChips, data]
                  }
                }
              })
            })
          }
        })
        setMultiIssueList(list)
        selectedChipRef.current = true
      }
    }
  }, [virPhotoNum])

  const assetId = get(viewObj, 'assetId', '')
  const woonboardingassetsId = get(viewObj, 'woonboardingassetsId', '')

  const handleAddIssues = issues => {
    const multiIssue = [...multiIssueList]
    const issueTypes = new Set([enums.ISSUE.TYPE.THERMAL_ANAMOLY, enums.ISSUE.TYPE.NEC_VIOLATION, enums.ISSUE.TYPE.OSHA_VIOLATION, enums.ISSUE.TYPE.REPLACE, enums.ISSUE.TYPE.REPAIR, enums.ISSUE.TYPE.OTHER, enums.ISSUE.TYPE.ULTRASONIC_ANOMALY, enums.ISSUE.TYPE.NFPA_70B_VIOLATION])
    const issueType = get(issues, 'value', null)

    if (issueTypes.has(issueType)) {
      multiIssue.push({
        isIssueLinkedForFix: resolvedOptions[1],
        issueDescription: '',
        issueTitle: '',
        issueType: issueType === enums.ISSUE.TYPE.NEC_VIOLATION || issueType === enums.ISSUE.TYPE.OSHA_VIOLATION || issueType === enums.ISSUE.TYPE.NFPA_70B_VIOLATION ? enums.ISSUE.TYPE.COMPLIANCE : issueType,
        issueCausedId: issueType === enums.ISSUE.TYPE.NEC_VIOLATION ? enums.ISSUE.CAUSED.NEC_VIOLATION : issueType === enums.ISSUE.TYPE.OSHA_VIOLATION ? enums.ISSUE.CAUSED.OSHA_VIOLATION : issueType === enums.ISSUE.TYPE.NFPA_70B_VIOLATION ? enums.ISSUE.CAUSED.NFPA_70B_VIOLATION : null,
        necViolation: null,
        oshaViolation: null,
        nfpa70BViolation: null,
        thermalAnomalyAdditionalIrPhoto: null,
        thermalAnomalyLocation: null,
        thermalAnomalyMeasuredAmps: null,
        thermalAnomalyMeasuredTemps: null,
        thermalAnomalyProblemDescription: null,
        thermalAnomalyCorrectiveAction: null,
        thermalAnomalyRefrenceTemps: null,
        thermalAnomalySubComponant: null,
        thermalClassification: null,
        woLineIssueId: null,
        thermalAnomalySeverityCriteria: null,
        issueImageList: [],
        typeOfUltrasonicAnamoly: null,
        locationOfUltrasonicAnamoly: '',
        sizeOfUltrasonicAnamoly: '',
        dynamicFieldJson:
          issueType === enums.ISSUE.TYPE.THERMAL_ANAMOLY
            ? [
                { phase: 'A', circuit: '', current_rating_amp: '', current_draw_amp: '', voltage_drop_millivolts: '' },
                { phase: 'B', circuit: '', current_rating_amp: '', current_draw_amp: '', voltage_drop_millivolts: '' },
                { phase: 'C', circuit: '', current_rating_amp: '', current_draw_amp: '', voltage_drop_millivolts: '' },
                { phase: 'Neutral', circuit: '', current_rating_amp: '', current_draw_amp: '', voltage_drop_millivolts: '' },
              ]
            : null,
        id: multiIssueList?.length + 1,
        isAbcPhaseRequiredForReport: false,
        selectedChips: [],
      })
      setMultiIssueList(multiIssue)
    }
    setIssueFlag([])
  }

  const handleRemoveIssue = id => {
    let newIssueList = [...multiIssueList]
    newIssueList.forEach(item => {
      if (item.id === id) {
        if (item.woLineIssueId !== null) {
          item.isDeleted = true
        }
      }
    })
    newIssueList = newIssueList.filter(item => !(item.id === id && item.woLineIssueId === null)).map((d, index) => ({ ...d, id: index + 1 }))
    setMultiIssueList(newIssueList)
    setDeleteIssueOpen([false, 0])
  }

  const difference = function (num1, num2) {
    return Math.abs(num1 - num2)
  }

  const handleMultiIssueChange = (id, value, key) => {
    const updatedIssue = [...multiIssueList]
    const currentIssue = updatedIssue.find(d => d.id === id)

    currentIssue[key] = value

    if (key === 'thermalAnomalyMeasuredTemps') {
      if (currentIssue[key] <= 0) {
        currentIssue['thermalAnomalyMeasuredTemps'] = 0
        currentIssue['thermalAnomalyMeasuredAmps'] = difference(0, currentIssue['thermalAnomalyRefrenceTemps'])
      } else {
        currentIssue['thermalAnomalyMeasuredAmps'] = difference(currentIssue['thermalAnomalyMeasuredTemps'], currentIssue['thermalAnomalyRefrenceTemps'])
      }
    } else if (key === 'thermalAnomalyRefrenceTemps') {
      if (currentIssue[key] <= 0) {
        currentIssue['thermalAnomalyRefrenceTemps'] = 0
      }
      currentIssue['thermalAnomalyMeasuredAmps'] = difference(currentIssue['thermalAnomalyMeasuredTemps'], currentIssue['thermalAnomalyRefrenceTemps'])
    }

    setMultiIssueList(updatedIssue)
  }

  const handleErrorMultiIssue = (name, id) => {
    const list = [...multiIssueList]
    const current = list.find(d => d.id === id)
    if (current) {
      if (!current.error) {
        current.error = {}
      }
      current.error[name] = null
      setMultiIssueList(list)
    } else {
      console.error(`No item found with id: ${id}`)
    }
  }

  const handleInputIssueChange = (issueId, value, key) => {
    const [phase, field] = key.split('.')
    setMultiIssueList(prevState =>
      prevState.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              dynamicFieldJson: issue.dynamicFieldJson.map(item => (item.phase === phase ? { ...item, [field]: value } : item)),
            }
          : issue
      )
    )
  }

  const issueOptions = [
    { label: 'Thermal Anomaly Detected', value: enums.ISSUE.TYPE.THERMAL_ANAMOLY, isHide: isOnboarding ? true : false },
    { label: 'Ultrasonic Anomaly', value: enums.ISSUE.TYPE.ULTRASONIC_ANOMALY, isHide: isOnboarding ? true : false },
    { label: 'NEC Violation', value: enums.ISSUE.TYPE.NEC_VIOLATION, isHide: false },
    { label: 'OSHA Violation', value: enums.ISSUE.TYPE.OSHA_VIOLATION, isHide: false },
    { label: 'NFPA 70B Violation', value: enums.ISSUE.TYPE.NFPA_70B_VIOLATION, isHide: false },
    { label: 'Repair Needed', value: enums.ISSUE.TYPE.REPAIR, isHide: false },
    { label: 'Replacement Needed', value: enums.ISSUE.TYPE.REPLACE, isHide: false },
    { label: 'Other', value: enums.ISSUE.TYPE.OTHER, isHide: false },
  ]

  const handleNameplateInfo = async () => {
    setOpenImageDrawer(true)
    setImageDrawerLoading(true)
    setHideFillButton(false)
    setNamePlateJson(null)
    const payload = {
      assetClassCode: get(assetClassCode, 'label', ''),
      assetNameplateImagePaths: uploadedImages.filter(d => d.assetPhotoType === photoTypes.nameplate && (d.imageDurationTypeId === 0 || d.imageDurationTypeId === null) && !d.isDeleted).map(d => d.url),
      woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null) ?? null,
      assetId: get(viewObj, 'assetId', null) ?? null,
    }

    try {
      const res = await onBoardingWorkorder.namePlateJsonForm(payload)
      if (res.success > 0) {
        setNamePlateJson(JSON.parse(res.data.nameplateJson))
        setHideFillButton(true)
        const updatedImages = uploadedImages.map(d => {
          if (d.assetPhotoType === photoTypes.nameplate && (d.imageDurationTypeId === 0 || d.imageDurationTypeId === null) && !d.isDeleted) {
            return {
              ...d,
              imageExtractedJson: res.data.nameplateJson,
            }
          } else {
            return d
          }
        })
        setUploadedImages(updatedImages)
      } else if (res.success < 0) {
        Toast.error(res.message)
        setHideFillButton(false)
      }
    } catch (err) {
      Toast.error(err)
      console.error('Error submitting nameplate JSON form:', err)
      setHideFillButton(false)
    } finally {
      setImageDrawerLoading(false)
    }
  }

  const handleFillAll = () => {
    const updatedInformation = { ...nameplateInformation }

    Object.keys(namePlateJson).forEach(key => {
      if (key in updatedInformation) {
        if (typeof updatedInformation[key] !== 'object' || updatedInformation[key] === null) {
          updatedInformation[key] = {}
        }
        updatedInformation[key]['value'] = namePlateJson[key]
      }
    })
    setNameplateInformation(updatedInformation)
  }

  const hasNameplateImage = uploadedImages.some(d => d.assetPhotoType === photoTypes.nameplate && (d.imageDurationTypeId === 0 || d.imageDurationTypeId === null) && !d.isDeleted)

  const handleIrPhotoChange = (id, value, key) => {
    const list = [...multiIssueList]
    const thermalList = list.find(d => d.id === id)
    const images = [...thermalList.selectedChips]
    const chipExists = images.some(chip => chip.id === value.id)
    const existingItemIndex = images.findIndex(d => d.value.irwoimagelabelmappingId === value.value.irwoimagelabelmappingId)
    if (!chipExists && (existingItemIndex === -1 || value.value.irwoimagelabelmappingId === null)) {
      thermalList[key] = [...images, value]
      setMultiIssueList(list)
    } else {
      images[existingItemIndex] = {
        ...images[existingItemIndex],
        value: {
          ...images[existingItemIndex].value,
          isDeleted: false,
        },
      }
      thermalList[key] = images
      setMultiIssueList(list)
    }
  }

  const handleChipDelete = (id, chipToDelete, key) => {
    const list = [...multiIssueList]
    const thermalList = list.find(d => d.id === id)
    const images = [...thermalList.selectedChips]

    const existingItemIndex = images.findIndex(d => chipToDelete.value.irwoimagelabelmappingId !== null && d.value.irwoimagelabelmappingId === chipToDelete.value.irwoimagelabelmappingId)

    if (existingItemIndex !== -1) {
      images[existingItemIndex] = {
        ...images[existingItemIndex],
        value: {
          ...images[existingItemIndex].value,
          isDeleted: true,
        },
      }
    }

    const chipExists = images.filter(chip => chip !== chipToDelete || chipToDelete.value.irwoimagelabelmappingId !== null)
    thermalList[key] = [...chipExists]
    setMultiIssueList(list)
  }

  const handleChipLable = d => {
    const visualPhoto = get(d, 'visualPhoto', '')
    const irPhoto = get(d, 'irPhoto', '')
    const typeValue = get(d, 'type.value', '')

    let label = ''
    if (visualPhoto && irPhoto) {
      label = `V: ${visualPhoto}${typeValue}, IR: ${irPhoto}${typeValue}`
    } else if (visualPhoto) {
      label = `V: ${visualPhoto}${typeValue}`
    } else if (irPhoto) {
      label = `IR: ${irPhoto}${typeValue}`
    }

    return label
  }

  const handleInputEstimate = (id, key, value) => {
    const updatedEstimate = [...estimateData.pmEstimationList]
    const currentEstimate = updatedEstimate.find(d => d.pmId === id)
    if (key === 'increment') {
      currentEstimate['estimationTime'] = Number(currentEstimate['estimationTime']) + 5
    } else if (key === 'decrement') {
      currentEstimate['estimationTime'] = Number(currentEstimate['estimationTime']) - 5
    } else {
      currentEstimate[key] = value
    }
    currentEstimate['error'] = null

    setEstimateData(prev => ({
      ...prev,
      pmEstimationList: updatedEstimate,
    }))
  }

  const handleErrorEstimation = (name, id) => {
    const list = [...estimateData.pmEstimationList]
    const current = list.find(d => d.id === id)
    if (current) {
      if (!current.error) {
        current.error = {}
      }
      current.error[name] = null
      setEstimateData(prev => ({
        ...prev,
        pmEstimationList: list,
      }))
    }
  }

  const handleAssetGroupChange = v => {
    setAssetGroup(v)
  }

  const handleAssetGroupCreated = async newAssetGroupId => {
    setSelectedAssetGroup(newAssetGroupId)
    reFetch()
  }

  const handleCheckLine = (id, lineLoadSideId) => {
    const checkLineSide = subComponentList.some(item => item.lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE)
    if (checkLineSide) {
      setChangeLineSide([true, id, lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE ? true : false])
    } else {
      const updatedList = subComponentList.map(item => (item.id === id ? { ...item, lineLoadSideId: item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE ? enums.SUB_COMPONENT_TYPE.LINE_SIDE : enums.SUB_COMPONENT_TYPE.LOAD_SIDE } : { ...item, lineLoadSideId: enums.SUB_COMPONENT_TYPE.LOAD_SIDE }))
      setSubComponentList(updatedList)
      const selectedComponent = updatedList.find(item => item.id === id)
      const componentName = changeLineSide[2] ? [] : selectedComponent
      setSubComponentAsset(componentName)

      const updatedFedByList = fedByList.map(item => ({
        ...item,
        subComponentAsset: componentName,
      }))
      setFedByList(updatedFedByList)
    }
  }

  const handleChangeLineSide = id => {
    const updatedList = subComponentList.map(item => (item.id === id ? { ...item, lineLoadSideId: item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE ? enums.SUB_COMPONENT_TYPE.LINE_SIDE : enums.SUB_COMPONENT_TYPE.LOAD_SIDE } : { ...item, lineLoadSideId: enums.SUB_COMPONENT_TYPE.LOAD_SIDE }))
    setSubComponentList(updatedList)

    const selectedComponent = updatedList.find(item => item.id === id)
    const componentName = changeLineSide[2] ? [] : selectedComponent
    setSubComponentAsset(componentName)

    const updatedFedByList = fedByList.map(item => ({
      ...item,
      subComponentAsset: componentName,
    }))
    setFedByList(updatedFedByList)
    setChangeLineSide([false, null, false])
  }

  const handleAddConductorType = () => {
    setConductorJson(prev => [...prev, { amount: 1, material: 'Copper', size: conductorSizeOptions[0], id: prev.length }])
  }

  const handleInputConductor = (id, key, value) => {
    const updatedConductor = [...conductorJson]
    const currentConductor = updatedConductor.find(d => d.id === id)
    if (key === 'increment') {
      currentConductor['amount'] = Number(currentConductor['amount']) + 1
    } else if (key === 'decrement') {
      currentConductor['amount'] = Math.max(Number(currentConductor['amount']) - 1, 1)
    } else {
      currentConductor[key] = value
    }
    setConductorJson(updatedConductor)
  }

  const handleEditFedBy = id => {
    const fedList = [...fedByList]
    const currectFed = fedList.find(d => d.id === id)
    const fedJson = JSON.parse(currectFed.fedbyDetailsJson)
    const conductorSize = fedJson.conductors.map((d, index) => ({
      ...d,
      id: index,
      size: conductorSizeOptions.find(val => val.value === d.size) || conductorSizeOptions[0],
    }))
    setConductorJson(conductorSize)
    setDiaMeter(Math.max(get(fedJson, 'diameter', 1), 1))
    setLength(Math.max(get(fedJson, 'length', 50), 5))
    setSets(Math.max(get(fedJson, 'sets', 1), 1))
    setConnectType(connectionType.find(d => d.label === fedJson.type).value)
    setMaterial(materialNonFlexType.find(d => d.label === fedJson.material)?.value)
    setTopLevelAsset([currectFed.fedBy])
    setSubComponentAssetOptions(handleSelectOptions(get(currectFed, 'fedBy.value', '')))
    setSubLevelAsset(handleSelectOptions(get(currectFed, 'fedBy.value', '')).find(val => val.value === currectFed.ocp?.value))
    setExistingFedByOpen([true, true, id])
  }

  return (
    <Drawer anchor='right' open={open} onClose={closeForm}>
      <FormTitle title={isNew ? 'Add New Asset' : 'Edit Asset Info'} closeFunc={closeForm} style={{ width: '100%', minWidth: '700px' }} />
      <div className='d-flex' style={{ height: 'calc(100vh - 65px)', background: '#efefef', width: openImageDrawer || isOpenCircuitView ? '100vw' : '' }}>
        <div style={{ padding: '10px 0 10px 10px' }}>
          <div style={{ padding: '16px', width: '200px', height: '100%', background: '#fff', borderRadius: '4px' }}>
            {formSectionNames.map((name, index) => (
              <SectionTab isActive={activeSectionName === name} onClick={() => changeSection(name)} key={name} title={name === 'SUB-COMPONENTS' ? "SUB-COMPONENTS (OCP'S)" : name} top={30 * index + 90} />
            ))}
          </div>
        </div>
        <div onScroll={handleScroll} ref={scrollableDiv} className='table-responsive d-flex' id='style-1' style={{ height: 'calc(100vh - 126px)', width: openImageDrawer || isOpenCircuitView ? '74vw' : '' }}>
          <div style={{ padding: '10px', width: '850px' }}>
            <div ref={formDiv} style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
              {/* basic info */}
              <FormSection id='basic-info' title='BASIC INFO' keepOpen>
                <MinimalInput value={get(asset, 'assetName', '')} onChange={value => handleInputChange('assetName', value)} error={error.assetName} label='Asset Name' placeholder='Add Asset Name' onFocus={() => setError({ ...error, assetName: null })} baseStyles={{ marginRight: 0 }} />
                <PhotosSection label='Asset Photos' type={photoTypes.profile} />
                <div className='d-flex'>
                  <MinimalAutoComplete
                    placeholder='Select Class'
                    value={assetClassCode}
                    error={error.assetClassCode}
                    onChange={v => handleClassCodeChange(v)}
                    options={isTopLevelComponent ? filter(classCodeOptions, { is_allowed_toplevel: true }) : filter(classCodeOptions, { is_allowed_to_create_subcomponent: true })}
                    label='Asset Class'
                    isClearable
                    w={100}
                    onFocus={() => setError({ ...error, assetClassCode: null })}
                    isDisabled={isAddingExisting || viewObj.isWoLineForExisitingAsset}
                    components={{ Option: CustomOptions }}
                  />
                </div>
                <div className='d-flex'>
                  <input ref={uploadQrRef} type='file' style={{ display: 'none' }} onChange={uploadQR} />
                  <MinimalInput value={get(asset, 'qrCode', '') || ''} onChange={value => handleInputChange('qrCode', value)} label='QR Code' placeholder='Add QR code' w={98} disabled={isAddingExisting} />
                  <FloatingButton isLoading={isQRUploading} tooltip='UPLOAD QR' onClick={handleQrUpload} icon={<CropFreeIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px' }} disabled={isAddingExisting || viewObj.isWoLineForExisitingAsset} />
                </div>
                <MinimalTextArea rows={3} value={get(asset, 'backOfficeNote', '') || ''} onChange={e => handleInputChange('backOfficeNote', e.target.value)} placeholder='Add Back Office Note ..' label='Back Office Note' w={100} baseStyles={{ marginBottom: 0 }} />
              </FormSection>

              {/* asset group */}
              <FormSection id='asset-group' title='ASSIGN ASSET GROUP' keepOpen>
                <div className='d-flex flex-row-reverse'>
                  <MinimalButton variant='contained' color='primary' text='Add New Asset Group' onClick={() => setOpenAddDrawer(true)} baseClassName='mr-2' />
                </div>
                <div className='d-flex'>
                  <MinimalAutoComplete placeholder='Select Asset Group' value={assetGroup} onChange={v => handleAssetGroupChange(v)} options={assetGroupData} label='Assign Asset Group' isClearable w={100} />
                </div>
              </FormSection>

              {/* photos */}
              <FormSection id='nameplate-information' title='NAMEPLATE INFORMATION' keepOpen>
                <MinimalDatePicker date={date} setDate={setDate} label='Commission Date' w={100} />
                {isEmpty(nameplateInformation) ? (
                  <></>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {Object.keys(nameplateInformation).map(d => {
                      if (nameplateInformation[d]['type'] === 'select') {
                        return (
                          <>
                            <MinimalInput
                              key={d}
                              value={get(nameplateInformation, [d, 'value'], '')}
                              onChange={value => {
                                if (d === 'size' && +value < 0) {
                                  handleChange(d, 0)
                                } else {
                                  handleChange(d, value)
                                }
                              }}
                              label={startCase(d)}
                              placeholder={`Add ${startCase(d)}`}
                              baseStyles={{ marginRight: 0 }}
                              type={d === 'size' ? 'number' : ''}
                              {...(d === 'size' ? { min: '0' } : {})}
                            />
                          </>
                        )
                      } else if (nameplateInformation[d]['type'] === 'textarea') return <MinimalTextArea rows={3} key={d} value={get(nameplateInformation, [d, 'value'], '')} onChange={e => handleChange(d, e.target.value)} label={startCase(d)} placeholder={`Add ${startCase(d)}`} baseStyles={{ marginRight: 0 }} />
                      else if (nameplateInformation[d]['type'] === 'phoneNumber') return <MinimalPhoneInput key={d} value={get(nameplateInformation, [d, 'value'], '')} onChange={value => handleChange(d, value)} label={startCase(d)} baseStyles={{ marginRight: 0 }} />
                      else
                        return (
                          <MinimalInput
                            key={d}
                            value={get(nameplateInformation, [d, 'value'], '')}
                            onChange={value => {
                              if (d === 'size' && +value < 0) {
                                handleChange(d, 0)
                              } else {
                                handleChange(d, value)
                              }
                            }}
                            label={startCase(d)}
                            placeholder={`Add ${startCase(d)}`}
                            baseStyles={{ marginRight: 0 }}
                            type={d.toLowerCase() === 'size' ? 'number' : ''}
                            {...(d === 'size' ? { min: '0' } : {})}
                          />
                        )
                    })}
                  </div>
                )}
                {!isEmpty(assetClassCode) && (
                  <>
                    <div className='d-flex justify-content-between'>
                      <div className='text-bold mr-2'>Nameplate Photos</div>
                      <div>
                        {hasNameplateImage && !isEmpty(assetClassCode) && <MinimalButton variant='contained' color='primary' text='View Nameplate Image' onClick={() => handleNameplateInfo()} baseClassName='mr-2 ' disabled={imageDrawerLoading} />}
                        <AssetImageUploadButton loading={isPhotoUploading[`${photoTypes.nameplate}_${0}_${undefined}`]} disabled={isPhotoUploading[`${photoTypes.nameplate}_${0}_${undefined}`]} onClick={() => handleUpload({ type: photoTypes.nameplate, duration: 0 })} />
                      </div>
                    </div>
                    {photoError[`${photoTypes.nameplate}_${0}_${undefined}`] && <span style={{ fontWeight: 800, color: 'red', marginLeft: 0 }}>{photoError[`${photoTypes.nameplate}_${0}_${undefined}`]}</span>}
                    <div>
                      <div className='pt-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                        {uploadedImages
                          .filter(d => d.assetPhotoType === photoTypes.nameplate && (d.imageDurationTypeId === 0 || d.imageDurationTypeId === null))
                          .map((d, index) => !d.isDeleted && <AssetImage onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.url}?value=${randomValue}`} randomValue onClick={() => (setPreview([true, photoTypes.nameplate]), setImageOrder(index))} />)}
                      </div>
                    </div>
                  </>
                )}
              </FormSection>
              {/* component */}
              <FormSection id={isTopLevelComponent ? 'sub-components' : 'top-level-component'} title={isTopLevelComponent ? "SUB-COMPONENTS (OCP's)" : 'TOP LEVEL COMPONENT'} keepOpen>
                {!componentType ? (
                  ''
                ) : isTopLevelComponent ? (
                  get(assetClassCode, 'is_allowed_subcomponent', false) === true ? (
                    <>
                      <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                        <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                          {subComponentColumns.map(({ label, width }) => (
                            <div key={label} className='text-bold' style={{ width }}>
                              {label}
                            </div>
                          ))}
                        </div>
                        {subComponentList.map(({ name, classData, circuit, npPhoto, id, error, wolineSublevelcomponentMappingId, subcomponentImageList, lineLoadSideId }, index) => (
                          <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                            <MinimalInput w={26} value={name} onChange={value => handleComponentRowChange('name', value, id)} placeholder='Enter Name' baseStyles={{ margin: 0, marginRight: '8px' }} error={error.name} disabled={!isEmpty(wolineSublevelcomponentMappingId)} onFocus={() => handleErrorSubComponent('name', id)} />
                            <MinimalAutoComplete
                              placeholder='Select Class'
                              value={classData}
                              onChange={v => handleComponentRowChange('classData', v, id)}
                              options={filter(classCodeOptions, { is_allowed_to_create_subcomponent: true })}
                              isClearable
                              w={26}
                              components={{ Option: CustomOptionsForSubComponent }}
                              onFocus={() => handleErrorSubComponent('classData', id)}
                              baseStyles={{ marginBottom: 0 }}
                              error={error.classData}
                              isDisabled={!isEmpty(wolineSublevelcomponentMappingId)}
                            />
                            <MinimalInput w={25} value={circuit} onChange={value => handleComponentRowChange('circuit', value, id)} placeholder='Enter Circuit(s)' baseStyles={{ margin: isEmpty(npPhoto) ? 0 : '0 8px 0 0' }} />
                            {get(classData, 'is_line_load_side_allowed', false) === true ? <MinimalToggleButton isCheck={lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE} onChange={() => handleCheckLine(id, lineLoadSideId)} /> : <span style={{ width: '51px' }}></span>}
                            <FloatingButton onClick={() => handleSubComponentPhoto({ id, wolineSublevelcomponentMappingId, subcomponentImageList })} icon={<AddAPhotoOutlinedIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
                            <FloatingButton onClick={() => handleRemoveComponentRow(id)} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
                          </div>
                        ))}
                        <div onClick={handleAddSubComponent} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
                          Add New Sub-Component (OCP's)
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                      Can't Add Sub-Components(OCP's) in this Asset Class
                    </div>
                  )
                ) : (
                  <>
                    <MinimalAutoComplete value={topLevelComponent} onChange={value => handleChangeInSelectedTopLevelComponent(value)} loading={initialLoading} placeholder='Top Level Component' options={topLevelComponentOptions} label='Select Top Level Component' isClearable w={100} />
                    {get(assetClassCode, 'is_line_load_side_allowed', false) === true && <MinimalButtonGroup label='Sub Component Position' value={lineLoadSidePosition} onChange={setLineLoadSidePosition} options={subComponentPosition} w={100} />}
                  </>
                )}
              </FormSection>
              {/* fed by */}
              {isTopLevelComponent && (
                <FormSection id='electrical-connections' title='ELECTRICAL CONNECTIONS' keepOpen>
                  <div className='d-flex flex-row-reverse'>
                    <MinimalButton variant='contained' color='primary' text='Use Existing Fed-By' onClick={handleOpenFedBy} />
                    <MinimalButton variant='contained' color='primary' text='Create New Fed-By' onClick={() => setCreateFedByOpen(true)} baseClassName='mr-2' />
                  </div>
                  <div style={{ borderRadius: '4px', width: '100%', margin: '14px 0 25px 0' }}>
                    {isEmpty(fedByList) ? (
                      <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                        No Fed-By present !
                      </div>
                    ) : (
                      fedByList.map(({ fedBy, type, id, length, style, ocp, conductorType, conductorName, racewayType, subComponentAsset, fedbyDetailsJson }) => {
                        const fedByJson = JSON.parse(fedbyDetailsJson)
                        const conductorLabels = fedByJson.conductors
                          .map(conductor => {
                            const materialLabel = conductor.material === 'Copper' ? 'Cu' : 'Al'
                            return `${conductor.amount}x ${materialLabel} ${conductor.size}`
                          })
                          .join(', ')
                        return (
                          <div key={id} style={{ border: '1px solid #dee2e6' }} className='fed-by-section'>
                            <div className='d-flex justify-content-between p-2' style={{ borderBottom: '1px solid #dee2e6' }}>
                              <LabelVal label='Line-Side Asset' value={get(fedBy, 'label', '')} inline />
                              <div>
                                <FloatingButton onClick={() => handleEditFedBy(id)} icon={<EditOutlined fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '34px', height: '32px', marginLeft: '10px', borderRadius: '4px' }} />
                                <FloatingButton onClick={() => handleRemoveFedBy(id)} icon={<CloseIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '34px', height: '32px', marginLeft: '10px', borderRadius: '4px' }} />
                              </div>
                            </div>
                            <div className='d-flex justify-content-between pl-2 py-3' style={{ borderBottom: '1px solid #dee2e6' }}>
                              {` ${fedByJson.sets} Parallel Sets ${fedByJson.diameter}" ${fedByJson.material} ${fedByJson.length}' ${conductorLabels}`}
                            </div>
                            {/* <div className='d-flex justify-content-between pt-2 pl-2' style={{ borderBottom: '1px solid #dee2e6' }}>
                            <MinimalAutoComplete options={handleSelectOptions(get(fedBy, 'value', ''))} value={ocp} onChange={value => handleFedByOptionsChange(id, value, 'ocp')} label='OCP' placeholder='Select OCP' w={30} isClearable inputStyles={styles.fedbySectionDrpInputStyle} />
                            <MinimalAutoComplete options={assetSubComponentOptions} value={subComponentAsset} onChange={value => handleFedByOptionsChange(id, value, 'subComponentAsset')} label='OCP Main' placeholder='Select OCP Main' w={30} isClearable inputStyles={styles.fedbySectionDrpInputStyle} />
                            <MinimalInput w={28} value={get(subComponentAsset, 'name', '')} placeholder='N/A' label='OCP Main' disabled />
                            <MinimalButtonGroup value={type} onChange={value => handleFedByTypeChange(id, value)} options={fedByTypeOptions} w={15} label='Type' />
                            <MinimalInput w={22} value={length} onChange={value => handleFedByStyleLengthChange(id, value, 'length')} placeholder='Conductor Length' label='Conductor Length' />
                          </div>
                          <div className='d-flex justify-content-between pt-2 pl-2'>
                            <MinimalAutoComplete options={conductorTypesOptions} value={conductorType} onChange={value => handleFedByOptionsChange(id, value, 'conductorType')} label='Conductor Material' placeholder='Select Material' w={25} isClearable inputStyles={styles.fedbySectionDrpInputStyle} />
                            <MinimalInput w={25} value={conductorName} onChange={value => handleFedByStyleLengthChange(id, value, 'conductorName')} baseStyles={{ marginRight: '8px' }} placeholder='Conductor Number' label='Conductor Number' type='number' maxLength='9' onInput={maxLengthCheck} />
                            <MinimalAutoComplete options={racewayTypesOptions} value={racewayType} onChange={value => handleFedByOptionsChange(id, value, 'racewayType')} label='Raceway Type' placeholder='Raceway Type' w={25} isClearable inputStyles={styles.fedbySectionDrpInputStyle} />
                            <MinimalInput w={25} value={style} onChange={value => handleFedByStyleLengthChange(id, value, 'style')} placeholder='Conductor Size' label='Conductor Size' />
                          </div> */}
                          </div>
                        )
                      })
                    )}
                  </div>
                  {isShowPanel && (
                    <div className='d-flex flex-row-reverse'>
                      <MinimalButton variant='contained' color='primary' text='View Panel Schedule' onClick={() => (setIsOpenCircuitView(true), setOpenImageDrawer(false))} baseClassName='my-2' />
                    </div>
                  )}
                  <PhotosSection label='Panel Schedule Photos' type={photoTypes.schedule} />
                </FormSection>
              )}
              {/* location */}
              <FormSection id='location' title='LOCATION' keepOpen>
                <div className='d-flex'>
                  {!isInstalling ? (
                    <>
                      <MinimalAutoComplete options={buildingOptions} value={get(asset, 'building', '')} onChange={value => handleBuildingChange(value)} label='Building' placeholder='Add Building' w={50} isDisabled={!isTopLevelComponent} isClearable error={error.building} onFocus={() => setError({ ...error, building: null })} />
                      <MinimalAutoComplete options={floorOptions} value={get(asset, 'floor', '')} onChange={value => handleFloorChange(value)} label='Floor' placeholder='Add Floor' w={50} isDisabled={!isTopLevelComponent} baseStyles={{ marginRight: 0 }} isClearable error={error.floor} onFocus={() => setError({ ...error, floor: null })} />
                    </>
                  ) : (
                    <>
                      <MinimalInput value={get(asset, 'building', '')} onChange={value => handleInputChange('building', value)} label='Building' placeholder='Add Building' w={50} />
                      <MinimalInput value={get(asset, 'floor', '')} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add Floor' w={50} baseStyles={{ marginRight: 0 }} />
                    </>
                  )}
                </div>
                <div className='d-flex'>
                  {!isInstalling ? (
                    <MinimalAutoComplete options={roomOptions} value={get(asset, 'room', '')} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add Room' w={50} isDisabled={!isTopLevelComponent} isClearable error={error.room} onFocus={() => setError({ ...error, room: null })} />
                  ) : (
                    <MinimalInput value={get(asset, 'room', '')} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add Room' w={50} />
                  )}
                  <MinimalInput value={get(asset, 'section', '') || ''} onChange={value => handleInputChange('section', value)} label='Section' placeholder='Add Section' w={50} baseStyles={{ marginRight: 0 }} />
                </div>
                <MinimalButtonGroup label='Location' value={location} onChange={value => setLocation(value)} options={locationOptions} w={100} baseStyles={{ marginRight: 0 }} />
              </FormSection>
              {/* condition */}
              <FormSection id='condition' title='CONDITION' keepOpen>
                <MinimalButtonGroup label='Condition of Maintenance' value={get(asset, 'maintenanceIndexType', 0)} onChange={value => handleInputChange('maintenanceIndexType', value)} options={maintenanceOptions} />
                <MinimalButtonGroup label='Operating Conditions' value={get(asset, 'conditionIndexType', 0)} onChange={value => handleInputChange('conditionIndexType', value)} options={conditionOptions} w={100} baseStyles={{ marginRight: 0 }} />
                <MinimalButtonGroup label='Select Criticality' value={get(asset, 'criticalityIndexType', 0)} onChange={value => handleInputChange('criticalityIndexType', value)} options={criticalityOptions} w={100} />
                {isShowPanel && <MinimalButtonGroup label='Panel Schedule' value={get(asset, 'panelSchedule', 0)} onChange={value => handleInputChange('panelSchedule', value)} options={PanelOptions} w={100} />}
                <MinimalButtonGroup label='Arc Flash Label Valid' value={get(asset, 'arcFlashLabelValid', null)} onChange={value => handleInputChange('arcFlashLabelValid', value)} options={arcFlashOptionsName} w={100} />
                <div className='d-flex justify-content-between align-items-center'>
                  <div className='text-bold' style={{ fontSize: '16px', fontWeight: 700 }}>
                    Flag Issues
                  </div>
                  <FloatingButton onClick={() => setIssueFlag(!issueFlag)} icon={!issueFlag ? <AddIcon fontSize='small' /> : <ExpandLessIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '32px', height: '32px', borderRadius: '4px' }} />
                </div>
                {issueFlag && (
                  <>
                    <div className='d-flex  mt-2'>
                      <MinimalAutoComplete options={issueOptions.filter(v => v.isHide === false)} value={issueFlag} onChange={value => handleAddIssues(value)} placeholder='Select Flag Issues' w={100} />
                    </div>
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.THERMAL_ANAMOLY && get(val, 'isDeleted', false) === false)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='Thermal Anomaly' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalAutoComplete
                                placeholder='Select Thermal Classification'
                                value={get(d, 'thermalClassification', null)}
                                onChange={value => handleMultiIssueChange(d.id, value, 'thermalClassification')}
                                options={thermalClassificationOptions}
                                label='Thermal Classification'
                                isClearable
                                error={get(d, 'error.thermalClassification', '')}
                                onFocus={() => handleErrorMultiIssue('thermalClassification', d.id)}
                                w={100}
                              />
                              <div style={{ display: 'grid', gridTemplateColumns: '50% 50%', gap: '10px' }}>
                                <MinimalInput value={get(d, 'thermalAnomalyLocation', '')} onChange={value => handleMultiIssueChange(d.id, value, 'thermalAnomalyLocation')} placeholder='Enter Location' label='Issue Location' />
                                <MinimalAutoComplete placeholder="Select Sub-Component (OCP's)" value={get(d, 'thermalAnomalySubComponant', null)} onChange={value => handleMultiIssueChange(d.id, value, 'thermalAnomalySubComponant')} label="Sub-Component(OCP's)" options={thermalAnomalySubComponentOptions} isClearable />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '33% 33% 33%', gap: '8px' }}>
                                <MinimalInput value={get(d, 'thermalAnomalyMeasuredTemps', '')} onChange={value => handleMultiIssueChange(d.id, value, 'thermalAnomalyMeasuredTemps')} label='Measured Temp.' placeholder='Enter temperature' type='number' min='0' />
                                <MinimalInput value={get(d, 'thermalAnomalyRefrenceTemps', '')} onChange={value => handleMultiIssueChange(d.id, value, 'thermalAnomalyRefrenceTemps')} label='Reference Temp.' placeholder='Enter temperature' type='number' min='0' />
                                <MinimalInput value={get(d, 'thermalAnomalyMeasuredAmps', '')} onChange={value => handleMultiIssueChange(d.id, value, 'thermalAnomalyMeasuredAmps')} label='Difference Temp.' placeholder='0' disabled />
                              </div>
                              <MinimalButtonGroup label='Severity Criteria' value={get(d, 'thermalAnomalySeverityCriteria', null)} onChange={value => handleMultiIssueChange(d.id, value, 'thermalAnomalySeverityCriteria')} options={severityCriteriaOptions} w={100} />
                              <MinimalTextArea rows={1} value={get(d, 'thermalAnomalyProblemDescription', '')} onChange={e => handleMultiIssueChange(d.id, e.target.value, 'thermalAnomalyProblemDescription')} label='Problem Description' placeholder='Enter Problem Description' w={100} />
                              <MinimalTextArea rows={1} value={get(d, 'thermalAnomalyCorrectiveAction', '')} onChange={e => handleMultiIssueChange(d.id, e.target.value, 'thermalAnomalyCorrectiveAction')} label='Corrective Action' placeholder='Enter Corrective Action' w={100} />

                              <div className='d-flex justify-content-between align-items-center' style={{ margin: '15px 0', width: '100%' }}>
                                <div style={{ marginTop: '-10px', width: '12%', fontWeight: 600 }}>IR Photos</div>
                                <MinimalAutoComplete placeholder='Select IR Photos' value={''} onChange={value => handleIrPhotoChange(d.id, value, 'selectedChips')} options={assetIrOptions} w={90} baseStyles={{ marginRight: '0px' }} />
                              </div>
                              <div style={{ margin: '-15px 5px 15px 85px', width: '90%' }}>
                                {!isEmpty(get(d, 'selectedChips', [])) &&
                                  get(d, 'selectedChips', []).map(chip => !get(chip.value, 'isDeleted', false) && <Chip key={get(chip, 'id', '')} label={handleChipLable(chip.value)} onDelete={() => handleChipDelete(d.id, chip, 'selectedChips')} deleteIcon={<CloseIcon />} style={{ marginRight: '5px', marginBottom: '5px' }} />)}
                              </div>
                              <div className='d-flex justify-content-between align-items-center' style={{ cursor: 'pointer' }}>
                                <div />
                                <div className='d-flex align-items-center'>
                                  <div style={{ fontWeight: 400, fontSize: '12px', color: '#BFBFBF' }}>Visible in Report</div>
                                  <Checkbox
                                    size='small'
                                    style={{ padding: 5, color: get(d, 'isAbcPhaseRequiredForReport', false) ? theme.palette.primary.main : theme.palette.primary }}
                                    checked={get(d, 'isAbcPhaseRequiredForReport', false)}
                                    onChange={value => handleMultiIssueChange(d.id, !get(d, 'isAbcPhaseRequiredForReport', false), 'isAbcPhaseRequiredForReport')}
                                  />
                                </div>
                              </div>

                              {/* Phase */}
                              {get(d, 'dynamicFieldJson', []) !== null && (
                                <TableContainer>
                                  <Table aria-label='simple table' className={classes.table}>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Phase</TableCell>
                                        <TableCell align='left'>Circuit #</TableCell>
                                        <TableCell align='left'>
                                          Current Rating
                                          <br /> (AMPS)
                                        </TableCell>
                                        <TableCell align='left'>
                                          Current Draw <br />
                                          (AMPS)
                                        </TableCell>
                                        <TableCell align='left'>
                                          Voltage Drop <br />
                                          (Millivolts)
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {get(d, 'dynamicFieldJson', [])?.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell component='th' scope='row'>
                                            {item.phase}
                                          </TableCell>
                                          <TableCell align='center'>
                                            <MinimalInput value={get(d, `dynamicFieldJson[${index}].circuit`, '')} onChange={value => handleInputIssueChange(d.id, value, `${item.phase}.circuit`)} />
                                          </TableCell>
                                          <TableCell align='left'>
                                            <MinimalInput value={get(d, `dynamicFieldJson[${index}].current_rating_amp`, '')} onChange={value => handleInputIssueChange(d.id, value, `${item.phase}.current_rating_amp`)} />
                                          </TableCell>
                                          <TableCell align='left'>
                                            <MinimalInput value={get(d, `dynamicFieldJson[${index}].current_draw_amp`, '')} onChange={value => handleInputIssueChange(d.id, value, `${item.phase}.current_draw_amp`)} />
                                          </TableCell>
                                          <TableCell align='left'>
                                            <MinimalInput value={get(d, `dynamicFieldJson[${index}].voltage_drop_millivolts`, '')} onChange={value => handleInputIssueChange(d.id, value, `${item.phase}.voltage_drop_millivolts`)} />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}

                              <div className='mt-2'>
                                <PhotosSection label='Before Photos' type={photoTypes.thermal} duration={photoDuration.before} multiIssueID={d.id} />
                                <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', false)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                                {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.thermal} duration={photoDuration.after} multiIssueID={d.id} />}
                              </div>
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.ULTRASONIC_ANOMALY && get(val, 'isDeleted', false) === false)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='Ultrasonic Anomaly' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalAutoComplete
                                placeholder='Select Type of Anomaly'
                                value={get(d, 'typeOfUltrasonicAnamoly', null)}
                                onChange={value => handleMultiIssueChange(d.id, value, 'typeOfUltrasonicAnamoly')}
                                options={UltrasonicAnomalyOptions}
                                label='Type of Anomaly'
                                isClearable
                                error={get(d, 'error.typeOfUltrasonicAnamoly', '')}
                                onFocus={() => handleErrorMultiIssue('typeOfUltrasonicAnamoly', d.id)}
                              />
                              <MinimalTextArea rows={3} value={get(d, 'locationOfUltrasonicAnamoly', '') || ''} onChange={e => handleMultiIssueChange(d.id, e.target.value, 'locationOfUltrasonicAnamoly')} placeholder='Enter Location of Anomaly Here ..' label='Location of Anomaly' w={100} />
                              <MinimalInput value={get(d, 'sizeOfUltrasonicAnamoly', '')} onChange={value => handleMultiIssueChange(d.id, value, 'sizeOfUltrasonicAnamoly')} label='Size of Anomaly' placeholder='E.G., 2mm deep, 15mm long' />
                              <PhotosSection label='Before Photos' type={photoTypes.ultrasonic} duration={photoDuration.before} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', false)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.ultrasonic} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.COMPLIANCE && get(val, 'isDeleted', false) === false)
                        .filter(c => c.issueCausedId === enums.ISSUE.CAUSED.NEC_VIOLATION)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='NEC Violation' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalAutoComplete
                                value={get(d, 'necViolation', null)}
                                error={get(d, 'error.necViolation', '')}
                                onChange={value => handleMultiIssueChange(d.id, value, 'necViolation')}
                                placeholder='Select code'
                                options={necVoilationOptions}
                                label='Select Code Violation'
                                isClearable
                                onFocus={() => handleErrorMultiIssue('necViolation', d.id)}
                              />
                              <PhotosSection label='Before Photos' type={photoTypes.nec} duration={photoDuration.before || null} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', false)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.nec} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.COMPLIANCE && get(val, 'isDeleted', false) === false)
                        .filter(c => c.issueCausedId === enums.ISSUE.CAUSED.OSHA_VIOLATION)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='OSHA Violation' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalAutoComplete
                                value={get(d, 'oshaViolation', null)}
                                error={get(d, 'error.oshaViolation', '')}
                                onChange={value => handleMultiIssueChange(d.id, value, 'oshaViolation')}
                                placeholder='Select code'
                                options={oshaVoilationOptions}
                                label='Select Code Violation'
                                isClearable
                                onFocus={() => handleErrorMultiIssue('oshaViolation', d.id)}
                              />
                              <PhotosSection label='Before Photos' type={photoTypes.osha} duration={photoDuration.before} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', null)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.osha} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.COMPLIANCE && get(val, 'isDeleted', false) === false)
                        .filter(c => c.issueCausedId === enums.ISSUE.CAUSED.NFPA_70B_VIOLATION)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='NFPA 70B Violation' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalAutoComplete
                                value={get(d, 'nfpa70BViolation', null)}
                                error={get(d, 'error.nfpa70BViolation', '')}
                                onChange={value => handleMultiIssueChange(d.id, value, 'nfpa70BViolation')}
                                placeholder='Select NFPA 70B'
                                options={nfpa70bOption}
                                label='Select NFPA 70B Violation'
                                isClearable
                                onFocus={() => handleErrorMultiIssue('nfpa70BViolation', d.id)}
                              />
                              <PhotosSection label='Before Photos' type={photoTypes.nfpa70b} duration={photoDuration.before} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', null)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.nfpa70b} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.REPAIR && get(val, 'isDeleted', false) === false)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='Repair Needed' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalInput value={get(d, 'issueTitle', '')} onChange={value => handleMultiIssueChange(d.id, value, 'issueTitle')} placeholder='Add Issue Title' label='Issue Title' w={100} error={get(d, 'error.issueTitle', '')} onFocus={() => handleErrorMultiIssue('issueTitle', d.id)} />
                              <MinimalTextArea rows={3} value={get(d, 'issueDescription', '') || ''} onChange={e => handleMultiIssueChange(d.id, e.target.value, 'issueDescription')} placeholder='Add description here ..' label='Issue Description' w={100} />
                              <PhotosSection label='Before Photos' type={photoTypes.repair} duration={photoDuration.before} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', null)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.repair} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.REPLACE && get(val, 'isDeleted', false) === false)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='Replacement Needed' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalInput value={get(d, 'issueTitle', '')} onChange={value => handleMultiIssueChange(d.id, value, 'issueTitle')} placeholder='Add Issue Title' label='Issue Title' w={100} error={get(d, 'error.issueTitle', '')} onFocus={() => handleErrorMultiIssue('issueTitle', d.id)} />
                              <MinimalTextArea rows={3} value={get(d, 'issueDescription', '') || ''} onChange={e => handleMultiIssueChange(d.id, e.target.value, 'issueDescription')} placeholder='Add description here ..' label='Issue Description' w={100} />
                              <PhotosSection label='Before Photos' type={photoTypes.replace} duration={photoDuration.before} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', null)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.replace} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                    {!isEmpty(multiIssueList) &&
                      multiIssueList
                        .filter(val => val.issueType === enums.ISSUE.TYPE.OTHER && get(val, 'isDeleted', false) === false)
                        .map(d => (
                          <div key={d.id}>
                            <FormSection title='Other' keepOpen isRemove onRemove={e => (setDeleteIssueOpen([true, d.id]), e.stopPropagation())}>
                              <MinimalInput value={get(d, 'issueTitle', '')} onChange={value => handleMultiIssueChange(d.id, value, 'issueTitle')} placeholder='Add Issue Title' label='Issue Title' w={100} error={get(d, 'error.issueTitle', '')} onFocus={() => handleErrorMultiIssue('issueTitle', d.id)} />
                              <MinimalTextArea rows={3} value={get(d, 'issueDescription', '') || ''} onChange={e => handleMultiIssueChange(d.id, e.target.value, 'issueDescription')} placeholder='Add description here ..' label='Issue Description' w={100} />
                              <PhotosSection label='Before Photos' type={photoTypes.other} duration={photoDuration.before} multiIssueID={d.id} />
                              <MinimalAutoComplete placeholder='Select Resolved ?' value={get(d, 'isIssueLinkedForFix', null)} onChange={value => handleMultiIssueChange(d.id, value, 'isIssueLinkedForFix')} options={resolvedOptions} label='Resolved ?' baseStyles={{ margin: '8px 0' }} />
                              {get(d, 'isIssueLinkedForFix.value', false) && <PhotosSection label='After Photos' type={photoTypes.other} duration={photoDuration.after} multiIssueID={d.id} />}
                            </FormSection>
                          </div>
                        ))}
                  </>
                )}
              </FormSection>
              {/* maintenance estimate */}
              <FormSection id='maintenance-estimate' title='MAINTENANCE ESTIMATE' keepOpen>
                <div key={1} style={{ border: '1px solid #dee2e6' }} className='fed-by-section'>
                  <div className='d-flex justify-content-between p-2 align-items-center' style={{ borderBottom: '1px solid #dee2e6' }}>
                    <LabelVal label='PM Plan' value={get(estimateData, 'planName', 'N/A') ?? 'N/A'} inline />
                  </div>
                  {isEmpty(get(estimateData, 'pmEstimationList', null)) ? (
                    <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                      No PMs Found !
                    </div>
                  ) : (
                    get(estimateData, 'pmEstimationList', []).map(d => {
                      return (
                        <div className='d-flex justify-content-between pt-2 pl-2' key={d.pmId}>
                          <MinimalInput
                            value={d.estimationTime}
                            type='number'
                            onChange={value => handleInputEstimate(d.pmId, 'estimationTime', value)}
                            label={d.title}
                            placeholder='Estimated Time (In Minutes)'
                            w={85}
                            baseStyles={{ marginRight: 0 }}
                            error={get(d, 'error.estimationTime', '')}
                            onFocus={() => handleErrorEstimation('estimationTime', d.pmId)}
                          />
                          <div>
                            <FloatingButton onClick={() => handleInputEstimate(d.pmId, 'decrement', '')} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px', borderRadius: '4px', marginRight: '8px' }} />
                            <FloatingButton onClick={() => handleInputEstimate(d.pmId, 'increment', '')} icon={<AddIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px', borderRadius: '4px', marginRight: '8px' }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </FormSection>
              {/* irscan photos */}
              {!isOnboarding && (
                <FormSection id='ir-scan-photos' title='IR SCAN PHOTOS' keepOpen>
                  {multipleFields.map((d, i) => {
                    if (!d.isDeleted)
                      return (
                        <div key={`field-${i}`} className='d-flex'>
                          <MinimalInput value={get(virPhotoNum, `[${i}].irPhoto`, '')} onChange={value => handlePhotoNumChange('irPhoto', i, value)} label='IR Photo #' placeholder='Add IR Photo #' w={35} />
                          <MinimalInput value={get(virPhotoNum, `[${i}].visualPhoto`, '')} onChange={value => handlePhotoNumChange('visualPhoto', i, value)} label=' Visual Photo #' placeholder=' Visual Photo #' w={35} disabled={photosType.imageType === enums.PHOTO_TYPE.IR_ONLY || photosType.cameraType === enums.CAMERA_TYPE.FLUKE} />
                          <MinimalAutoComplete value={get(virPhotoNum, `[${i}].type`, null)} onChange={v => handlePhotoNumChange(v, i, 'type')} options={imageTypeOptions} label='Photo Type' w={20} onFocus={() => handleTypeFocus(i)} error={photoNoTypeErrorIndexes[i] ? { error: true, msg: 'Type is required !' } : null} />
                          <FloatingButton
                            onClick={() => updateFieldCount(i === multipleFields.length - 1, i)}
                            icon={i === multipleFields.length - 1 ? <AddIcon fontSize='small' /> : <RemoveIcon fontSize='small' />}
                            style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px', borderRadius: '4px' }}
                          />
                        </div>
                      )
                    return null
                  })}
                </FormSection>
              )}
              {/* others */}
              <FormSection id='other' title='OTHER' keepOpen baseMargin>
                <MinimalTextArea rows={3} value={get(asset, 'otherNotes', '') || ''} onChange={e => handleInputChange('otherNotes', e.target.value)} placeholder='Add comments here ..' label='Other Comments' w={100} />
                {/* <PhotosSection label='Additional Photos' type={photoTypes.additional} /> */}
              </FormSection>
            </div>
            {/* white space */}
            <div style={{ height: '175px' }}></div>
          </div>
        </div>
        {/* image details */}
        {isOpenCircuitView && <ViewTampCircuit onClose={() => setIsOpenCircuitView(false)} dataList={get(viewObj, 'feedingCircuitList', [])} nameplate={nameplateInformation} />}
        {openImageDrawer && (
          <>
            <div className='table-responsive d-flex' id='style-1' style={{ height: 'calc(100vh - 126px)' }}>
              <div style={{ padding: '10px', width: '51vw' }}>
                <div style={{ background: '#fff', borderRadius: '4px', height: 'calc(100vh - 148px)' }} className='table-responsive' id='style-1'>
                  <div className='d-flex justify-content-between align-items-center' style={{ padding: '6px 10px', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                    <strong style={{ fontSize: '14px' }}>NAMEPLATE IMAGE DETAILS</strong>
                    <div className='d-flex'>
                      {hideFillButton && <MinimalButton variant='contained' color='primary' text='Fill All' baseClassName='mr-2' onClick={handleFillAll} />}
                      {!imageDrawerLoading && (
                        <IconButton aria-label='close' size='small' onClick={() => handleNameplateInfo()}>
                          <RefreshOutlinedIcon style={{ cursor: 'pointer' }} />
                        </IconButton>
                      )}
                      <IconButton aria-label='close' size='small' onClick={() => setOpenImageDrawer(false)}>
                        <CloseIcon style={{ cursor: 'pointer' }} />
                      </IconButton>
                    </div>
                  </div>
                  {imageDrawerLoading ? (
                    <div className='d-flex justify-content-center align-items-center ml-3' style={{ height: 'calc(100vh - 200px)' }}>
                      <CircularProgress size={40} thickness={5} />
                    </div>
                  ) : isEmpty(namePlateJson) ? (
                    <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: 'calc(100vh - 220px)' }}>
                      Nameplate Information Not Found
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '15px' }}>
                      {Object.keys(namePlateJson).map(d => {
                        return (
                          <div className='d-flex align-items-center justify-content-between'>
                            <MinimalInput key={d} value={get(namePlateJson, [d], '')} label={startCase(d)} baseStyles={{ marginRight: 0 }} w={85} disabled />
                            <MinimalButton variant='contained' color='primary' text='Use' onClick={() => handleChange(d, get(namePlateJson, [d], ''))} baseClassName='mr-2' style={{ marginLeft: '10px', marginTop: '9px' }} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        {isInReview ? (
          <MinimalButton variant='contained' color='primary' text='Save & Accept' loadingText='Saving...' onClick={() => validateForm(enums.woTaskStatus.Complete)} loading={isSaving === enums.woTaskStatus.Complete} disabled={isSaving === enums.woTaskStatus.Complete} style={{ background: '#37d482' }} />
        ) : (
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={closeForm} />
        )}
        {isNew ? (
          <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' onClick={() => validateForm(enums.woTaskStatus.Open)} loading={isSaving === enums.woTaskStatus.Open} disabled={isSaving === enums.woTaskStatus.Open} />
        ) : (
          <div>
            {isInReview ? (
              <>
                <MinimalButton variant='contained' color='primary' text='Hold' loadingText='Holding...' onClick={() => validateForm(enums.woTaskStatus.Hold)} loading={isSaving === enums.woTaskStatus.Hold} disabled={isSaving === enums.woTaskStatus.Hold} baseClassName='mr-2 yellow_button' />
                <MinimalButton variant='contained' color='primary' text='Reject' onClick={() => setIsRejectOpen(true)} baseClassName='red_button' />
              </>
            ) : (
              <>
                <MinimalButton
                  variant='contained'
                  color='primary'
                  text='Save'
                  loadingText='Saving...'
                  onClick={() => validateForm(isQuote ? enums.woTaskStatus.Open : enums.woTaskStatus.InProgress)}
                  loading={isQuote ? isSaving === enums.woTaskStatus.Open : isSaving === enums.woTaskStatus.InProgress}
                  disabled={isQuote ? isSaving === enums.woTaskStatus.Open : isSaving === enums.woTaskStatus.InProgress}
                  baseClassName='mr-2'
                />
                {!isQuote && <MinimalButton variant='contained' color='primary' text='Submit' loadingText='Submitting...' onClick={() => validateForm(enums.woTaskStatus.ReadyForReview)} loading={isSaving === enums.woTaskStatus.ReadyForReview} disabled={isSaving === enums.woTaskStatus.ReadyForReview} style={{ background: '#37d482' }} />}
              </>
            )}
          </div>
        )}
      </div> */}
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={closeForm} />
        {isQuote && isNew ? (
          <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' onClick={() => validateForm(enums.woTaskStatus.Open)} loading={isSaving === enums.woTaskStatus.Open} disabled={isSaving === enums.woTaskStatus.Open} />
        ) : (
          <div>
            <MinimalButton
              variant='contained'
              color='primary'
              text='Save'
              loadingText='Saving...'
              onClick={() => validateForm(isQuote ? enums.woTaskStatus.Open : enums.woTaskStatus.InProgress)}
              loading={isQuote ? isSaving === enums.woTaskStatus.Open : isSaving === enums.woTaskStatus.InProgress}
              disabled={(isQuote ? isSaving === enums.woTaskStatus.Open : isSaving === enums.woTaskStatus.InProgress) || nameplateInfoLoading || fedByLoading}
              baseClassName='mr-2'
            />
            {!isQuote && (
              <MinimalButton
                variant='contained'
                color='primary'
                text='Submit'
                loadingText='Submitting...'
                onClick={() => validateForm(enums.woTaskStatus.ReadyForReview)}
                loading={isSaving === enums.woTaskStatus.ReadyForReview}
                disabled={isSaving === enums.woTaskStatus.ReadyForReview || nameplateInfoLoading || fedByLoading}
                style={{ background: '#37d482' }}
              />
            )}
          </div>
        )}
      </div>
      {isPreviewOpen[0] && (
        <ImagePreview
          open={isPreviewOpen[0]}
          onClose={() => (setPreview([false, 0]), setIssueImageList([]))}
          imageIndex={imageOrder}
          images={isEmpty(issueImageList) ? uploadedImages.filter(d => d.assetPhotoType === isPreviewOpen[1] && !d.isDeleted) : issueImageList?.filter(d => d.assetPhotoType === isPreviewOpen[1] && !d.isDeleted)}
          urlKey='url'
          reFetch={() => setRandomValue(Math.random())}
        />
      )}
      {isCreateFedByOpen && <CreateFedBy asset={asset} obj={viewObj} open={isCreateFedByOpen} onClose={() => setCreateFedByOpen(false)} afterSubmit={createFedBy} classCodeOptions={classCodeOptions} woId={workOrderID} isInstalling={isInstalling} />}
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
      {isSubComponentPopupOpen && <SubComponentMultiplePhotoPop savePhotos={keepPhoto} data={subComponentPhotoInfo} open={isSubComponentPopupOpen} onClose={() => setSubComponentPopupOpen(false)} />}

      {/* Existing FedBy */}
      <PopupModal width='750px' open={isExistingFedByOpen[0]} onClose={handleCloseFedBy} title='Edit Connection' handleSubmit={handleExistingFedBy} cta='Save' disableCTA={isEmpty(topLevelAsset[0])} isFixed tblResponsive>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>Line-Side Asset</div>
          <MinimalAutoComplete
            value={topLevelAsset}
            onChange={val => handleTopAsset(val)}
            loading={topSubLevlHiararchyLoading}
            placeholder='Select Line-Side Asset'
            options={filter(topComponentAssetOptions, obj => !includedFedBy?.includes(obj.value) && ![assetId, woonboardingassetsId]?.includes(obj.value))}
            w={45}
            isClearable
            isDisabled={isExistingFedByOpen[1]}
          />
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>Load-Side (OCP)</div>
          <MinimalAutoComplete options={filter(subComponentAssetOptions, item => item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE)} value={subLevelAsset} loading={topSubLevlHiararchyLoading} onChange={value => handleSubAsset(value)} placeholder='Select OCP' w={45} isClearable />
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>Line-Side (OCP Main)</div>
          <MinimalInput w={45} value={get(subComponentAsset, 'name', '')} placeholder='N/A' disabled />
        </div>

        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>Type</div>
          <MinimalButtonGroup value={connectType} onChange={setConnectType} options={connectionType} w={80} />
        </div>
        {(connectType === 1 || connectType === 2) && (
          <div className='d-flex justify-content-between align-items-center'>
            <div className='text-bold'>Material</div>
            {connectType === 1 && <MinimalButtonGroup value={material} onChange={setMaterial} options={filter(materialNonFlexType, obj => obj.value <= 4)} w={50} />}
            {connectType === 2 && <MinimalButtonGroup value={material} onChange={setMaterial} options={filter(materialNonFlexType, obj => obj.value >= 5)} w={50} />}
          </div>
        )}

        <div className='d-flex justify-content-between align-items-center' style={{ height: '50px' }}>
          <div className='text-bold'>Diameter (inches)</div>
          <div className='d-flex align-items-center justify-content-between mx-2' style={{ fontSize: 15, width: '130px' }}>
            <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => setDiaMeter(Math.max(diaMeter - 0.5, 1))}>
              −
            </span>
            <span className='text-bold'>{diaMeter}</span>
            <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => setDiaMeter(diaMeter + 0.5)}>
              +
            </span>
          </div>
        </div>
        <div className='d-flex justify-content-between align-items-center' style={{ height: '50px' }}>
          <div className='text-bold'>Length (feet)</div>
          <div className='d-flex align-items-center justify-content-between mx-2' style={{ fontSize: 15, width: '130px' }}>
            <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => setLength(Math.max(length - 5, 5))}>
              −
            </span>
            <span className='text-bold'>{length}</span>
            <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => setLength(length + 5)}>
              +
            </span>
          </div>
        </div>
        <div className='d-flex justify-content-between align-items-center' style={{ height: '50px' }}>
          <div className='text-bold'>Parallel Sets</div>
          <div className='d-flex align-items-center justify-content-between mx-2' style={{ fontSize: 15, width: '130px' }}>
            <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => setSets(Math.max(sets - 1, 1))}>
              −
            </span>
            <span className='text-bold'>{sets}</span>
            <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => setSets(sets + 1)}>
              +
            </span>
          </div>
        </div>
        <div className='text-bold'>Conductors</div>
        {conductorJson.map(d => {
          return (
            <div className='d-flex justify-content-between align-items-center mt-2' key={d.id}>
              <div className='d-flex justify-content-between align-items-center' style={{ height: '50px' }}>
                <div className='d-flex align-items-center justify-content-between' style={{ fontSize: 15, width: '130px' }}>
                  <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => handleInputConductor(d.id, 'decrement', '')}>
                    −
                  </span>
                  <span className='text-bold'>{get(d, 'amount', 0)}</span>
                  <span className='d-flex align-items-center justify-content-center text-bold' style={{ width: 25, height: 25, cursor: 'pointer', border: '1px solid', borderRadius: '50%' }} onClick={() => handleInputConductor(d.id, 'increment', '')}>
                    +
                  </span>
                </div>
              </div>
              <MinimalButtonGroup value={get(d, 'material', 'Copper')} onChange={value => handleInputConductor(d.id, 'material', value)} options={conductorTypesOptions} w={30} baseStyles={{ marginTop: '10px' }} />
              <MinimalAutoComplete options={conductorSizeOptions} value={get(d, 'size', '18 AWG')} onChange={value => handleInputConductor(d.id, 'size', value)} label='Conductor Size' w={25} />
            </div>
          )
        })}
        {conductorJson.length < 4 && (
          <div onClick={handleAddConductorType} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
            Add Conductor Type
          </div>
        )}
      </PopupModal>
      {isDeleteIssueOpen[0] && <DialogPrompt title='Delete Issue' text='Are you sure you want to delete this Issue ?' open={isDeleteIssueOpen[0]} ctaText='Delete' action={() => handleRemoveIssue(isDeleteIssueOpen[1])} handleClose={() => setDeleteIssueOpen([false, 0])} />}
      {isOpenAddDrawer && <AddGroup onAssetGroupCreated={handleAssetGroupCreated} open={isOpenAddDrawer} onClose={() => setOpenAddDrawer(false)} />}
      {/* Line/load side */}
      <DialogPrompt
        title={`${changeLineSide[2] ? 'Remove' : 'Assign'} Line-Side Component`}
        text={changeLineSide[2] ? 'Are you sure you want to Remove this sub-component (OCP) as a Line-Side component?' : 'Are you sure you want to Assign this sub-component (OCP) as a Line-Side component? The current Line-Side component will be converted to a Load-Side component. Please confirm!'}
        open={changeLineSide[0]}
        ctaText={`${changeLineSide[2] ? 'Remove' : 'Confirm'}`}
        action={() => handleChangeLineSide(changeLineSide[1])}
        handleClose={() => setChangeLineSide([false, null, false])}
      />
    </Drawer>
  )
}
export default Edit
