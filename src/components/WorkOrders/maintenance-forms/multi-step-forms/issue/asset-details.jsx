import React, { useState, useEffect, useRef, useContext } from 'react'
import CropFreeIcon from '@material-ui/icons/CropFree'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'
import { useTheme } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'

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

import { snakifyKeys } from 'helpers/formatters'
import { get, isEmpty, differenceBy, startCase, set, filter, orderBy } from 'lodash'
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
  thermalClassificationOptions,
  locationOptions,
  thermalAnomalyProbableCauseOptions,
  thermalAnomalyRecommendationOptions,
  necVoilationOptions,
  oshaVoilationOptions,
  physicalConditionOptions,
  fedByTypeOptions,
  subComponentColumns,
  fedByTypeOptionsName,
  racewayTypesOptions,
  conductorTypesOptions,
  fedByColumns,
  photoTypes,
  thermalAnomalySubComponentOptions,
  photoDuration,
  PanelOptions,
  resolvedOptions,
  arcFlashOptionsName,
  subComponentIssuesColumns,
  connectionType,
  materialNonFlexType,
  conductorSizeOptions,
} from 'components/WorkOrders/onboarding/utils.js'
import { isValidURL } from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/utils.js'

import { SubComponentMultiplePhotoPop, SubComponentPhotoPop } from 'components/WorkOrders/onboarding/components'
import enums from 'Constants/enums'
import { nanoid } from 'nanoid'
import $ from 'jquery'
import issueContext from 'components/WorkOrders/maintenance-forms/multi-step-forms/issue/context'
import ViewTampCircuit from 'components/WorkOrders/onboarding/view-tamp-circuit'
import { MAX_IMG_UPLOAD } from 'components/Assets/tree/constants'
import heic2any from 'heic2any'
import DialogPrompt from 'components/DialogPrompt'
import { EditOutlined } from '@material-ui/icons'

const styles = {
  fedbySectionDrpInputStyle: { fontSize: '12px', background: 'none', padding: '0.7px 6px', border: '1px solid #a1a1a1' },
}

const InstallAssetForMaintenance = ({ onClose, onPrevious, onNext, isNew, classCodeOptions, workOrderID, isOnboarding, lineObj = {}, isInReview, isAddingExisting, workOrderNumber, buildingOptions: buildingOpts = [], fixedLocations = {}, isInstalling, parentDrawer }) => {
  const [error, setError] = useState({})
  const [photoError, setPhotoError] = useState('')
  const [photoErrorType, setPhotoErrorType] = useState('')
  const [uploadingPhotoType, setUploadingPhotoType] = useState({ type: 0, duration: 0 })
  const [asset, setAsset] = useState({})
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const uploadRef = useRef(null)
  const uploadQrRef = useRef(null)
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [isQRUploading, setQRUploading] = useState(false)
  const [assetClassCode, setClassCode] = useState(null)
  const [thermalClassification, setThermalClassification] = useState(null)
  const [location, setLocation] = useState(null)
  const [date, setDate] = useState(null)
  const theme = useTheme()
  const [multipleFields, setMultipleFields] = useState([{ isDeleted: false }])
  const [selectedFedBy, setSelectedFedBy] = useState([])
  const [fedByOptions, setFedByOptions] = useState([])
  const [fedByLoading, setFedByLoading] = useState(false)
  const [physicalCondition, setPhysicalCondition] = useState(null)
  const [codeCompliance, setCodeCompliance] = useState(null)
  //flag issues
  const [flagIssues, setFlagIssue] = useState({ thermal: false, nec: false, osha: false, none: true, repair: false, replace: false, other: false })
  const [flagIssuesResolved, setFlagIssueResolved] = useState({ thermal: resolvedOptions[1], nec: resolvedOptions[1], osha: resolvedOptions[1], repair: resolvedOptions[1], replace: resolvedOptions[1], other: resolvedOptions[1] })
  const [necVoilation, setNecVoilation] = useState(null)
  const [oshaVoilation, setOshaVoilation] = useState(null)
  const [thermalAnomalyProbableCause, setThermalAnomalyProbableCause] = useState(null)
  const [thermalAnomalyRecommendation, setThermalAnomalyRecommendation] = useState(null)
  const [thermalAnomalySubComponant, setThermalAnomalySubComponant] = useState(null)
  const [virPhotoNum, setVirPhotoNum] = useState([{ irPhoto: '', visualPhoto: '', type: null }])
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
  const formSectionNames = sectionNames(isOnboarding, componentType === enums.COMPONENT_TYPE.SUB_COMPONENT, false, true)
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
  const { initialLoading, data: topLevelComponentOptions } = useFetchData({ fetch: onBoardingWorkorder.component.getAssetsByLevel, payload: payloadForTopLevelComps, formatter: d => formatTopLevelOptions(get(d, 'data', {})), defaultValue: [], condition: isTopLevelComponent === false })
  //others
  const [otherAssetInfo, setOtherAssetInfo] = useState({})
  const [imageOrder, setImageOrder] = useState(0)
  //locations
  const [buildingOptions, setBuildingOptions] = useState(buildingOpts)
  const [floorOptions, setFloorOptions] = useState([])
  const [roomOptions, setRoomOptions] = useState([])
  // OCR
  const [openImageDrawer, setOpenImageDrawer] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [extractedJson, setExtractedJson] = useState([])
  const [copied, setCopied] = useState(false)
  const [isHoveredIndex, setIsHoveredIndex] = useState(-1)
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
  const [subComponentAsset, setSubComponentAsset] = useState([])
  const [includedFedBy, setIncludedFedBy] = useState([])
  const [isShowPanel, setShowPanel] = useState(false)
  const [namePlateJson, setNamePlateJson] = useState(null)
  const [hideFillButton, setHideFillButton] = useState(false)
  const [isOpenCircuitView, setIsOpenCircuitView] = useState(false)
  const [changeLineSide, setChangeLineSide] = useState([false, null, false])

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
    const topComponentAsset = orderBy([...mainOpts, ...obOpts], [e => e.label && e.label?.toLowerCase()], ['asc'])

    const mainSub = get(data, 'subcomponentMainAssets', []) || []
    const obSub = get(data, 'subcomponentObwoAssets', []) || []
    const mainSubOpts = mainSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.assetId }))
    const obSubOpts = obSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.woonboardingassetsId, isOB: true }))
    const subComponentAsset = orderBy([...mainSubOpts, ...obSubOpts], [e => e.label && e.label?.toLowerCase()], ['asc'])

    setSubComponentAssetOptions(subComponentAsset)
    setMainSubOptions(subComponentAsset)
    setTopComponentAssetOptions(topComponentAsset)

    if (!isNew || isAddingExisting) {
      const fedByKey = isAddingExisting ? 'assetParentMappingList' : 'woObAssetFedByMapping'
      const viewObj = get(issueDetails, 'asset.type', '') === 'ADD_EXISTING' ? other : assetDetails
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
  const { loading: topSubLevlHiararchyLoading, data: topSubLevlHiararchy } = useFetchData({ fetch: onBoardingWorkorder.fedBy.topSubHiararchy, payload: { id: workOrderID }, formatter: d => formatTopLevelHiararchy(get(d, 'data', {})), defaultValue: [] })

  const {
    data: { issueDetails, assetDetails, other },
    updateIssueDetails,
  } = useContext(issueContext)
  const isMainAsset = issueDetails.isAnExistingIssue || (get(issueDetails, 'asset.type', '') === 'ADD_EXISTING' && !get(issueDetails, 'asset.isTemp', false))
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
  const viewObj = get(issueDetails, 'asset.type', '') === 'ADD_EXISTING' ? other : assetDetails

  // panel logic
  useEffect(() => {
    if (!isEmpty(assetClassCode)) {
      setShowPanel(get(assetClassCode, 'classType', '')?.includes('PANELS') ? true : false)
    }
  }, [assetClassCode])

  useEffect(() => {
    const images = get(viewObj, 'assetImageList', [])
    if (!isEmpty(images) && images.some(e => isValidURL(encodeURI(e.assetPhoto)))) {
      images
        .filter(e => isValidURL(encodeURI(e.assetPhoto)))
        .forEach(im => {
          im.url = im.assetPhoto
        })
    }
    setUploadedImages(images)
    setAsset(viewObj)
    let classCode = null
    classCodeOptions.forEach(d => {
      if (!isEmpty(viewObj.assetClassCode) && d.label?.toLowerCase() === viewObj.assetClassCode?.toLowerCase()) classCode = d
    })
    setClassCode(classCode)
    setShowPanel(get(viewObj, 'assetClassType', '')?.includes('PANELS') ? true : false)
    // Asset Subcomponent
    // const subAssetOptions = orderBy(
    //   get(viewObj, 'woObAssetSublevelcomponentMapping', [])?.map(d => ({ label: d.sublevelcomponentAssetName, value: d.sublevelcomponentAssetId, isSublevelcomponentFromObWo: d.isSublevelcomponentFromObWo, isTemp: false })),
    //   [e => e.label && e.label?.toLowerCase()],
    //   ['asc']
    // )
    // setAssetSubComponentOptions(subAssetOptions)

    if (get(viewObj, `tempAssetDetails.panelSchedule`, '')) {
      const panel = PanelOptions.find(d => d.value === get(viewObj, `tempAssetDetails.panelSchedule`, null))
      setAsset(asset => ({ ...asset, panelSchedule: get(panel, 'value', null) }))
    }

    if (get(viewObj, `tempAssetDetails.arcFlashLabelValid`, null)) {
      const flash = arcFlashOptionsName.find(d => d.value === get(viewObj, `tempAssetDetails.arcFlashLabelValid`, null))
      setAsset(asset => ({ ...asset, arcFlashLabelValid: get(flash, 'value', null) }))
    }

    // ;(async () => {
    //   $('#pageLoading').show()
    //   setFedByLoading(true)
    //   try {
    //     const assetNameOpts = await onBoardingWorkorder.fedBy.topSubHiararchy({ id: workOrderID })

    //     const mainList = get(assetNameOpts, 'data.toplevelMainAssets', []) || []
    //     const obList = get(assetNameOpts, 'data.toplevelObwoAssets', []) || []

    //     const options = [...mainList.map(asset => ({ label: asset.assetName, value: asset.assetId })), ...obList.map(asset => ({ label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))]

    //     setFedByOptions(options)
    //     setTopComponentAssetOptions(options)

    //     const mainSub = get(assetNameOpts, 'data.subcomponentMainAssets', []) || []
    //     const obSub = get(assetNameOpts, 'data.subcomponentObwoAssets', []) || []

    //     const subOptions = [...mainSub.map(sub => ({ label: sub.assetName, value: sub.assetId })), ...obSub.map(sub => ({ label: sub.assetName, value: sub.woonboardingassetsId }))]

    //     setMainSubOptions(subOptions)
    //     setSubComponentAssetOptions(subOptions)

    //     if (!isNew || isAddingExisting) {
    //       const fedByKey = isAddingExisting ? 'assetParentMappingList' : 'woObAssetFedByMapping'
    //       const fedIDs = get(viewObj, [fedByKey], []).map(d => d.parentAssetId)

    //       const fedByTypes = get(viewObj, [fedByKey], []).reduce((acc, d) => {
    //         acc[d.parentAssetId] = {
    //           type: d.fedByUsageTypeId,
    //           length: get(d, 'length', ''),
    //           style: get(d, 'style', ''),
    //           ocp: d.fedByViaSubcomponantAssetId,
    //           subComponentAsset: d.viaSubcomponantAssetId,
    //           conductorType: d.conductorTypeId,
    //           conductorName: get(d, 'numberOfConductor', ''),
    //           racewayType: d.racewayTypeId,
    //         }
    //         return acc
    //       }, {})

    //       const fedByList = options
    //         .filter(d => fedIDs.includes(d.value))
    //         .map((d, index) => {
    //           const fedByData = get(fedByTypes, [d.value], {})
    //           return {
    //             fedBy: { ...d, name: d.label },
    //             type: fedByData.type,
    //             id: index + 1,
    //             length: fedByData.length,
    //             style: fedByData.style,
    //             ocp: subOptions.find(val => val.value === fedByData.ocp),
    //             subComponentAsset: subOptions.find(val => val.value === fedByData.subComponentAsset),
    //             conductorType: conductorTypesOptions.find(type => type.value === fedByData.conductorType),
    //             conductorName: fedByData.conductorName,
    //             racewayType: racewayTypesOptions.find(type => type.value === fedByData.racewayType),
    //           }
    //         })

    //       setIncludedFedBy(fedByList.map(val => get(val, 'fedBy.value')))
    //       if (!isEmpty(fedByList)) {
    //         setFedByList(fedByList)
    //       }
    //     }
    //   } catch (error) {
    //     console.error(error)
    //     setFedByOptions([])
    //   }

    //   setFedByLoading(false)
    //   $('#pageLoading').hide()
    // })()
    if (!isNew || isAddingExisting) {
      setThermalClassification(thermalClassificationOptions.find(d => d.value === viewObj.thermalClassificationId))
      if (viewObj.commisiionDate) {
        const dueD = new Date(viewObj.commisiionDate)
        setDate({ month: dueD.getMonth() + 1, day: dueD.getDate(), year: dueD.getFullYear() })
      } else setDate(null)
    }
    setLocation(isAddingExisting ? get(viewObj, 'assetPlacement', null) : get(viewObj, 'location', null))
    setCodeCompliance(get(viewObj, 'codeCompliance', null))
    setPhysicalCondition(physicalConditionOptions.find(d => d.value === viewObj.assetOperatingConditionState))
    //
    if (!isNew && !isEmpty(viewObj)) setComponentType(viewObj.componentLevelTypeId)
    if (!isEmpty(viewObj.woObAssetSublevelcomponentMapping)) {
      const subCompList = viewObj.woObAssetSublevelcomponentMapping
        .filter(e => e.isDeleted === false)
        .map((d, i) => ({
          ...d,
          id: i + 1,
          name: d.sublevelcomponentAssetName || '',
          classData: classCodeOptions.find(cc => cc.id === d.sublevelcomponentAssetClassId),
          error: { name: null, classData: null },
          circuit: d.circuit || '',
          npPhoto: isEmpty(d.imageName) ? null : { fileUrl: d.imageUrl, filename: d.imageName },
          lineLoadSideId: get(d, 'lineLoadSideId', null),
          subcomponentImageList: get(d, 'subcomponentImageList', []),
        }))
      setSubComponentList(subCompList)
    }
    setError({})
  }, [viewObj, classCodeOptions, isNew, isOnboarding, workOrderID])
  //
  const handleUpload = ({ type, duration }) => {
    setPhotoError('')
    setPhotoErrorType(type)
    setUploadingPhotoType({ type, duration })
    uploadRef.current && uploadRef.current.click()
  }
  // const addPhoto = async event => {
  //   event.preventDefault()
  //   setPhotoUploading(true)

  //   const inputElement = event.target
  //   const files = Array.from(inputElement.files)

  //   if (!files || files.length === 0) {
  //     return // Handle cases where no files are selected
  //   }

  //   if (files.length > MAX_IMG_UPLOAD) {
  //     Toast.error(`You can upload up to ${MAX_IMG_UPLOAD} images at a time.`)
  //     return
  //   }

  //   const formData = new FormData()
  //   let hasImgError = false
  //   const validExtensions = ['heif', 'heic', 'jpg', 'jpeg', 'png', 'gif', 'eps']

  //   for (const [index, file] of files.entries()) {
  //     const extension = file.name.split('.').slice(-1).pop().toLowerCase()

  //     if (!validExtensions.includes(extension)) {
  //       setError({ ...error, photos: { error: true, msg: 'Invalid Image format!' } })
  //       hasImgError = true
  //       continue
  //     }

  //     let processedFile = file

  //     // Convert HEIC/HEIF to JPG using heic2any
  //     if (['heic', 'heif'].includes(extension)) {
  //       try {
  //         const blob = await heic2any({
  //           blob: file,
  //           toType: 'image/jpeg',
  //           quality: 0.8, // You can adjust the quality
  //         })

  //         // Create a new File object for the converted image
  //         processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
  //           type: 'image/jpeg',
  //           lastModified: file.lastModified,
  //         })
  //       } catch (error) {
  //         console.error('HEIC to JPG conversion failed:', error)
  //         setError({ ...error, photos: { error: true, msg: 'HEIC/HEIF conversion failed!' } })
  //         hasImgError = true
  //         continue
  //       }
  //     }

  //     formData.append('file', processedFile)

  //     const reader = new FileReader()
  //     reader.onload = () => {
  //       if (!hasImgError && index === files.length - 1) {
  //         setError({ ...error, photos: null })
  //         uploadPhoto(formData, photoErrorType)
  //       }
  //     }
  //     reader.readAsDataURL(processedFile)
  //   }

  //   if (inputElement && inputElement.value) {
  //     inputElement.value = null
  //   }
  // }

  const addPhoto = e => {
    e.preventDefault()

    const files = Array.from(e.target.files)

    if (files.length > MAX_IMG_UPLOAD) {
      Toast.error(`You can upload up to ${MAX_IMG_UPLOAD} images at a time.`)
      return
    }

    const formData = new FormData()
    let hasImgError = false
    const validExtensions = ['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF', 'HEIC', 'HEIF', 'heic', 'heif']
    files.forEach((file, index) => {
      const extension = file.name.split('.').slice(-1).pop().toLowerCase()

      if (!validExtensions.includes(extension)) {
        Toast.error('Invalid Image format!')
        hasImgError = true
        return
      }

      formData.append('file', file)

      const reader = new FileReader()
      reader.onload = d => {
        if (!hasImgError && index === files.length - 1) {
          setPhotoError('')
          uploadPhoto(formData, photoErrorType)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = null
  }

  const uploadPhoto = async (formData, assetPhotoType) => {
    setPhotoUploading(true)
    try {
      const res = [photoTypes.repair, photoTypes.replace, photoTypes.other].includes(uploadingPhotoType.type) ? await issues.uploadPhoto(formData) : await onBoardingWorkorder.uploadPhoto(formData)
      if (res.success) {
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
        } else Toast.error(res.message)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setPhotoUploading(false)
  }
  const removeImage = image => {
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
  const handleOtherInputChange = (name, value) => setOtherAssetInfo({ ...otherAssetInfo, [name]: value })
  const validateForm = async status => {
    parentDrawer(false)
    setOpenImageDrawer(false)

    const isValid = await validate({ assetName: asset.assetName, assetClassCode: get(assetClassCode, 'label', ''), building: get(asset, 'building.value', ''), floor: get(asset, 'floor.value', ''), room: get(asset, 'room.value', '') }, isInstalling)
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
    if (isValid === true && !isTypeValid && isEmpty(subComponentErrors)) {
      parentDrawer(false)
      submitData(status)
    }
  }
  const submitData = async status => {
    const isUuidValid = id => (isEmpty(id) ? null : [...new Set([...id.split('').filter(d => d !== '-')])].length !== 1)
    const payload = { ...asset }
    payload.assetImageList = uploadedImages.filter(d => !(d.isDeleted && !d.woonboardingassetsimagesmappingId) || !(d.isDeleted && !d.wolineIssueImageMappingId))
    payload.status = status
    payload.assetClassCode = get(assetClassCode, 'label', '')
    payload.commisiionDate = date !== null ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null
    payload.assetOperatingConditionState = get(physicalCondition, 'value', null)
    payload.isWoLineForExisitingAsset = !!isAddingExisting || !!viewObj.isWoLineForExisitingAsset

    if (get(selectedFedBy, 'isOB', null)) {
      payload.fedByObAssetId = get(selectedFedBy, 'value', null)
      payload.fedBy = null
    } else {
      payload.fedByObAssetId = null
      payload.fedBy = get(selectedFedBy, 'value', null)
    }

    payload.flagIssueNecViolation = flagIssues.nec
    payload.flagIssueOshaViolation = flagIssues.osha
    payload.oshaViolation = get(oshaVoilation, 'value', null)
    payload.necViolation = get(necVoilation, 'value', null)
    payload.location = location
    payload.codeCompliance = codeCompliance

    const nameplateData = {}
    if (!isEmpty(nameplateInformation)) {
      Object.keys(nameplateInformation).forEach(key => {
        nameplateData[key] = nameplateInformation[key]['type'] === 'select' ? get(nameplateInformation[key], ['value'], null) : get(nameplateInformation[key], ['value'], '')
      })
    }
    payload.formNameplateInfo = JSON.stringify(nameplateData)
    payload.dynmicFieldsJson = JSON.stringify(otherAssetInfo)

    if (!isOnboarding) {
      payload.thermalClassificationId = get(thermalClassification, 'value', null)
      payload.voltage = get(asset, 'voltage', null)
      payload.ratedAmps = get(asset, 'ratedAmps', null)
      payload.thermalAnomalyProbableCause = get(thermalAnomalyProbableCause, 'value', null)
      payload.thermalAnomalyRecommendation = get(thermalAnomalyRecommendation, 'value', null)
      payload.thermalAnomalySubComponant = get(thermalAnomalySubComponant, 'value', null)
      payload.flagIssueThermalAnamolyDetected = flagIssues.thermal
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
          woObAssetFedById: isUuidValid(get(obj, 'woObAssetFedById', '')) ? get(obj, 'woObAssetFedById', null) : null,
          parentAssetId: d.fedBy.value,
          isParentFromObWo: !!d.fedBy.isOB,
          woonboardingassetsId: isUuidValid(get(viewObj, 'woonboardingassetsId', '')) ? get(viewObj, 'woonboardingassetsId', null) : null,
          isDeleted: false,
          // fedByUsageTypeId: d.type,
          // length: get(d, 'length', ''),
          // style: get(d, 'style', ''),
          // conductorTypeId: get(d, 'conductorType.value', 0),
          // numberOfConductor: !isEmpty(d.conductorName) ? parseInt(get(d, 'conductorName', 0)) : 0,
          // racewayTypeId: get(d, 'racewayType.value', 0),
          viaSubcomponantAssetId: d?.subComponentAsset?.isTemp === false ? get(d, 'subComponentAsset.sublevelcomponentAssetId', null) : null,
          viaSubcomponantAssetName: get(d, 'subComponentAsset.sublevelcomponentAssetName', ''),
          viaSubcomponantAssetClassCode: get(d, 'subComponentAsset.classData.className', ''),
          fedByViaSubcomponantAssetId: get(d, 'ocp.value', null),
          isViaSubcomponantAssetFromObWo: get(d, 'subComponentAsset.isSublevelcomponentFromObWo', true),
          isFedByViaSubcomponantAssetFromObWo: !isEmpty(d?.ocp?.woonboardingassetsId) ? true : false,
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
          sublevelcomponentAssetClassId: sub.classData.id,
          circuit: sub.circuit,
          lineLoadSideId: get(sub, 'lineLoadSideId', null),
          subcomponentImageList: get(sub, 'subcomponentImageList', []),
        })
      })
      const deletedSubComponents = differenceBy(get(viewObj, 'woObAssetSublevelcomponentMapping', []), subComponentMappings, 'wolineSublevelcomponentMappingId')
      deletedSubComponents.forEach(d => subComponentMappings.push({ ...d, isDeleted: true }))
    }
    payload.woObAssetSublevelcomponentMapping = isTopLevelComponent
      ? get(assetClassCode, 'is_allowed_subcomponent', false) === true
        ? subComponentMappings.map(d => ({
            ...d,
            wolineSublevelcomponentMappingId: isUuidValid(get(d, 'wolineSublevelcomponentMappingId', '')) ? get(d, 'wolineSublevelcomponentMappingId', null) : null,
            woonboardingassetsId: isUuidValid(get(d, 'woonboardingassetsId', '')) ? get(d, 'woonboardingassetsId', null) : null,
            sublevelcomponentAssetId: isUuidValid(get(d, 'sublevelcomponentAssetId', '')) ? get(d, 'sublevelcomponentAssetId', null) : null,
          }))
        : []
      : []
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
    payload.woObAssetToplevelcomponentMapping = isTopLevelComponent
      ? []
      : topLevelMappings.map(d => ({
          ...d,
          wolineToplevelcomponentMappingId: isUuidValid(get(d, 'wolineToplevelcomponentMappingId', '')) ? get(d, 'wolineToplevelcomponentMappingId', null) : null,
          woonboardingassetsId: isUuidValid(get(d, 'woonboardingassetsId', '')) ? get(d, 'woonboardingassetsId', null) : null,
        }))
    // locations
    payload.tempMasterBuildingId = get(payload, 'building.tempMasterBuildingId', null)
    payload.tempMasterFloorId = get(payload, 'floor.tempMasterFloorId', null)
    payload.tempMasterRoomId = get(payload, 'room.tempMasterRoomId', null)
    payload.tempFormiobuildingId = get(payload, 'building.tempFormiobuildingId', null)
    payload.tempFormiofloorId = get(payload, 'floor.tempFormiofloorId', null)
    payload.tempFormioroomId = get(payload, 'room.tempFormioroomId', null)
    payload.building = isInstalling ? get(asset, 'building', null) : !isTopLevelComponent ? null : ''
    payload.floor = isInstalling ? get(asset, 'floor', null) : !isTopLevelComponent ? null : ''
    payload.room = isInstalling ? get(asset, 'room', null) : !isTopLevelComponent ? null : ''
    payload.tempBuilding = get(payload, 'building', null)
    payload.tempFloor = get(payload, 'floor', null)
    payload.tempRoom = get(payload, 'floor', null)
    payload.tempSection = get(asset, 'section', null)
    // flag resolve
    payload.isNecViolationResolved = get(flagIssuesResolved, 'nec.value', null)
    payload.isOshaViolationResolved = get(flagIssuesResolved, 'osha.value', null)
    payload.isThermalAnomalyResolved = get(flagIssuesResolved, 'thermal.value', null)
    payload.wolineIssueList = []
    //
    updateIssueDetails('assetDetails', payload)
    updateIssueDetails('other', payload)
    const issueData = { ...issueDetails }
    if (get(issueDetails, 'asset.type', '') === 'CREATE_NEW') {
      issueData['asset'].linkedAsset = { assetId: 'TEMP-ID', value: 'TEMP-ID', label: payload.assetName, assetName: payload.assetName }
      updateIssueDetails('issueDetails', issueData)
    } else {
      issueData['asset'].linkedAsset = { ...get(issueData, 'asset.linkedAsset', {}), label: payload.assetName, assetName: payload.assetName }
      updateIssueDetails('issueDetails', issueData)
    }
    onNext()
  }
  const closeForm = async () => {
    onClose()
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
        } catch (error) {
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
    const subComponent = { name: '', classData: null, error: { name: null, classData: null }, circuit: '', npPhoto: {}, id: subComponentList.length + 1, isTemp: true, lineLoadSideId: null }
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
    setSubComponentList(list)

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
    setFedByList(updatedFedBytList)

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
      //   [e => e.label && e.label?.toLowerCase()],
      //   ['asc']
      // )
      // setAssetSubComponentOptions(ocp)
    } catch (error) {
      setFedByOptions([])
    }
    setFedByLoading(false)
  }
  // locations
  const handleBuildingChange = building => {
    const floorOpts = get(building, 'tempFloors', []).map(d => ({ ...d, label: d.tempFormioFloorName, value: d.tempFormiofloorId }))
    setFloorOptions(floorOpts)
    setRoomOptions([])
    setAsset({ ...asset, building, floor: null, room: null })
  }
  const handleFloorChange = floor => {
    const roomOpts = get(floor, 'tempRooms', []).map(d => ({ ...d, label: d.tempFormioRoomName, value: d.tempFormioroomId }))
    setRoomOptions(roomOpts)
    setAsset({ ...asset, floor, room: null })
  }
  const setLocationAsDefaultForOrphanSubLevelAsset = () => {
    if (isInstalling) {
      setAsset({ ...asset, building: 'Default', floor: 'Default', room: 'Default' })
    } else {
      const building = buildingOptions.find(d => d.label === 'Default')
      const floorOpts = get(building, 'tempFloors', []).map(d => ({ ...d, label: d.tempFormioFloorName, value: d.tempFormiofloorId }))
      const floor = floorOpts.find(d => d.label === 'Default')
      const roomOpts = get(floor, 'tempRooms', []).map(d => ({ ...d, label: d.tempFormioRoomName, value: d.tempFormioroomId }))
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
  const PhotosSection = ({ label, type, duration = null }) => {
    return (
      <>
        <div className='d-flex justify-content-between'>
          <div className='text-bold mt-2'>{label}</div>
          <AssetImageUploadButton loading={isPhotoUploading && uploadingPhotoType.type === type && uploadingPhotoType.duration === duration} disabled={isPhotoUploading} onClick={() => handleUpload({ type, duration })} />
        </div>
        {!isEmpty(uploadedImages.filter(d => d.assetPhotoType === type)) && (
          <div className='pt-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
            {!isEmpty(uploadedImages) && uploadedImages.filter(d => d.assetPhotoType === type && d.imageDurationTypeId === duration).map((d, index) => !d.isDeleted && <AssetImage onClick={() => (setPreview([true, type]), setImageOrder(index))} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={d.url} randomValue />)}
          </div>
        )}
      </>
    )
  }
  //
  // form value handlers
  const handleInputChange = (name, value) => setAsset({ ...asset, [name]: value })
  const handleOnPrevious = () => {
    parentDrawer(false)
    const isUuidValid = id => (isEmpty(id) ? null : [...new Set([...id.split('').filter(d => d !== '-')])].length !== 1)
    const payload = { ...asset }
    if (!isEmpty(uploadedImages)) {
      payload.assetImageList = uploadedImages.filter(d => !(d.isDeleted && !d.woonboardingassetsimagesmappingId) || !(d.isDeleted && !d.wolineIssueImageMappingId))
    }
    payload.status = enums.woTaskStatus.Open
    payload.assetClassCode = get(assetClassCode, 'label', '')
    payload.commisiionDate = date !== null ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null
    payload.assetOperatingConditionState = get(physicalCondition, 'value', null)
    payload.isWoLineForExisitingAsset = !!isAddingExisting || !!viewObj.isWoLineForExisitingAsset

    if (get(selectedFedBy, 'isOB', null)) {
      payload.fedByObAssetId = get(selectedFedBy, 'value', null)
      payload.fedBy = null
    } else {
      payload.fedByObAssetId = null
      payload.fedBy = get(selectedFedBy, 'value', null)
    }

    payload.flagIssueNecViolation = flagIssues.nec
    payload.flagIssueOshaViolation = flagIssues.osha
    payload.oshaViolation = get(oshaVoilation, 'value', null)
    payload.necViolation = get(necVoilation, 'value', null)
    payload.location = location
    payload.codeCompliance = codeCompliance

    const nameplateData = {}
    if (!isEmpty(nameplateInformation)) {
      Object.keys(nameplateInformation).forEach(key => {
        nameplateData[key] = nameplateInformation[key]['type'] === 'select' ? get(nameplateInformation[key], ['value', 'value'], null) : get(nameplateInformation[key], ['value'], '')
      })
    }
    payload.formNameplateInfo = JSON.stringify(nameplateData)
    payload.dynmicFieldsJson = JSON.stringify(otherAssetInfo)

    if (!isOnboarding) {
      payload.thermalClassificationId = get(thermalClassification, 'value', null)
      payload.voltage = get(asset, 'voltage', null)
      payload.ratedAmps = get(asset, 'ratedAmps', null)
      payload.thermalAnomalyProbableCause = get(thermalAnomalyProbableCause, 'value', null)
      payload.thermalAnomalyRecommendation = get(thermalAnomalyRecommendation, 'value', null)
      payload.thermalAnomalySubComponant = get(thermalAnomalySubComponant, 'value', null)
      payload.flagIssueThermalAnamolyDetected = flagIssues.thermal
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
        const obj = old.find(x => x.parentAssetId === d.fedBy.value)
        fedByMapping.push({
          woObAssetFedById: isUuidValid(get(obj, 'woObAssetFedById', '')) ? get(obj, 'woObAssetFedById', null) : null,
          parentAssetId: d.fedBy.value,
          isParentFromObWo: !!d.fedBy.isOB,
          woonboardingassetsId: isUuidValid(get(viewObj, 'woonboardingassetsId', '')) ? get(viewObj, 'woonboardingassetsId', null) : null,
          isDeleted: false,
          fedByUsageTypeId: d.type,
          length: get(d, 'length', ''),
          style: get(d, 'style', ''),
          conductorTypeId: get(d, 'conductorType.value', 0),
          numberOfConductor: !isEmpty(d.conductorName) ? parseInt(get(d, 'conductorName', 0)) : 0,
          racewayTypeId: get(d, 'racewayType.value', 0),
          viaSubcomponantAssetId: get(d, 'subComponentAsset.value', null),
          viaSubcomponantAssetName: get(d, 'subComponentAsset.label', ''),
          viaSubcomponantAssetClassCode: get(d, 'subComponentAsset.classCode', ''),
          fedByViaSubcomponantAssetId: get(d, 'ocp.value', null),
          isViaSubcomponantAssetFromObWo: get(d, 'subComponentAsset.isSublevelcomponentFromObWo', true),
          isFedByViaSubcomponantAssetFromObWo: !isEmpty(d?.ocp?.woonboardingassetsId) ? true : false,
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
          isSublevelcomponentFromObWo: true,
          isDeleted: false,
          sublevelcomponentAssetName: sub.name,
          sublevelcomponentAssetClassId: sub.classData.id,
          circuit: sub.circuit,
          // imageName: get(sub, 'npPhoto.filename', null),
          // imageUrl: get(sub, 'npPhoto.fileUrl', null),
          subcomponentImageList: get(sub, 'subcomponentImageList', []),
        })
      })
      const deletedSubComponents = differenceBy(get(viewObj, 'woObAssetSublevelcomponentMapping', []), subComponentMappings, 'wolineSublevelcomponentMappingId')
      deletedSubComponents.forEach(d => subComponentMappings.push({ ...d, isDeleted: true }))
    }
    payload.woObAssetSublevelcomponentMapping = isTopLevelComponent
      ? subComponentMappings.map(d => ({
          ...d,
          wolineSublevelcomponentMappingId: isUuidValid(get(d, 'wolineSublevelcomponentMappingId', '')) ? get(d, 'wolineSublevelcomponentMappingId', null) : null,
          woonboardingassetsId: isUuidValid(get(d, 'woonboardingassetsId', '')) ? get(d, 'woonboardingassetsId', null) : null,
          sublevelcomponentAssetId: isUuidValid(get(d, 'sublevelcomponentAssetId', '')) ? get(d, 'sublevelcomponentAssetId', null) : null,
        }))
      : []
    // top level mapping
    const topLevelMappings = []
    const oldTopLevelMappingIds = []
    if (!isEmpty(viewObj.woObAssetToplevelcomponentMapping)) {
      get(viewObj, 'woObAssetToplevelcomponentMapping', []).forEach(d => {
        oldTopLevelMappingIds.push(d.toplevelcomponentAssetId)
        if (d.toplevelcomponentAssetId !== get(topLevelComponent, 'value', '')) topLevelMappings.push({ ...d, isDeleted: true })
        else topLevelMappings.push(d)
      })
      if (!isEmpty(topLevelComponent) && !oldTopLevelMappingIds.includes(get(topLevelComponent, 'value', ''))) {
        topLevelMappings.push({ wolineToplevelcomponentMappingId: null, woonboardingassetsId: get(viewObj, 'woonboardingassetsId', null), toplevelcomponentAssetId: get(topLevelComponent, 'value', null), isToplevelcomponentFromObWo: !!get(topLevelComponent, 'isOB', false), isDeleted: false })
      }
      payload.woObAssetToplevelcomponentMapping = isTopLevelComponent
        ? []
        : topLevelMappings.map(d => ({
            ...d,
            wolineToplevelcomponentMappingId: isUuidValid(get(d, 'wolineToplevelcomponentMappingId', '')) ? get(d, 'wolineToplevelcomponentMappingId', null) : null,
            woonboardingassetsId: isUuidValid(get(d, 'woonboardingassetsId', '')) ? get(d, 'woonboardingassetsId', null) : null,
          }))
    }
    // locations
    payload.tempMasterBuildingId = get(payload, 'building.tempMasterBuildingId', null)
    payload.tempMasterFloorId = get(payload, 'floor.tempMasterFloorId', null)
    payload.tempMasterRoomId = get(payload, 'room.tempMasterRoomId', null)
    payload.tempFormiobuildingId = get(payload, 'building.tempFormiobuildingId', null)
    payload.tempFormiofloorId = get(payload, 'floor.tempFormiofloorId', null)
    payload.tempFormioroomId = get(payload, 'room.tempFormioroomId', null)
    payload.building = isInstalling ? get(asset, 'building', null) : !isTopLevelComponent ? null : ''
    payload.floor = isInstalling ? get(asset, 'floor', null) : !isTopLevelComponent ? null : ''
    payload.room = isInstalling ? get(asset, 'room', null) : !isTopLevelComponent ? null : ''
    payload.tempBuilding = get(payload, 'building', null)
    payload.tempFloor = get(payload, 'floor', null)
    payload.tempRoom = get(payload, 'floor', null)
    payload.tempSection = get(asset, 'section', null)
    // flag resolve
    payload.isNecViolationResolved = get(flagIssuesResolved, 'nec.value', null)
    payload.isOshaViolationResolved = get(flagIssuesResolved, 'osha.value', null)
    payload.isThermalAnomalyResolved = get(flagIssuesResolved, 'thermal.value', null)
    payload.wolineIssueList = []
    //
    updateIssueDetails('assetDetails', payload)
    updateIssueDetails('other', payload)
    onPrevious()
  }

  // image details textreact
  const textRactApi = async image => {
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

  const handleImageDetails = async image => {
    setImageObject(image)
    setOpenImageDrawer(true)
    setImageDrawerLoading(true)
    parentDrawer(true)
    setImagePreviewUrl(image.url)

    if (image.assetPhotoType === photoTypes.nameplate) {
      if (!isEmpty(image.imageExtractedJson)) {
        setExtractedJson(JSON.parse(image.imageExtractedJson))
        setImageDrawerLoading(false)
      } else {
        textRactApi(image)
      }
    }
  }

  useEffect(() => {
    const questions = extractedJson.filter(block => block.blockType.Value === 'QUERY')
    const answers = extractedJson.filter(block => block.blockType.Value === 'QUERY_RESULT')

    const questionAnswerPairs = questions.map(question => {
      const answerId = question?.relationships[0]?.Ids.map(id => id)
      const answer = answers?.find(ans => answerId?.includes(ans?.id))

      return {
        question: question.query.Text,
        answer: answer ? answer.text : '',
        id: Math.random(),
      }
    })
    setQuestions(questionAnswerPairs)
  }, [extractedJson])

  // copy text
  const handleCopyText = text => {
    setCopied(true)
    navigator.clipboard.writeText(text)
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

  const handleOpenFedBy = () => {
    // const ocp = orderBy(
    //   subComponentList
    //     .filter(val => !isEmpty(val?.name) && !isEmpty(val?.classData))
    //     .map(d => ({ label: get(d, 'name', '') || '', value: d?.isTemp === true ? nanoid() : get(d, 'sublevelcomponentAssetId', null), classCode: get(d, 'classData.label', '') || '', isSublevelcomponentFromObWo: get(d, 'isSublevelcomponentFromObWo', true), isTemp: d?.isTemp === true ? true : false || false })),
    //   [e => e.label && e.label?.toLowerCase()],
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
  //     [e => e.label && e.label?.toLowerCase()],
  //     ['asc']
  //   )
  //   setAssetSubComponentOptions(ocp)
  // }, [subComponentList])

  const assetId = get(viewObj, 'assetId', '')
  const woonboardingassetsId = get(viewObj, 'woonboardingassetsId', '')

  const handleNameplateInfo = async () => {
    setOpenImageDrawer(true)
    parentDrawer(true)
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
    <>
      <div className='d-flex' style={{ height: 'calc(100% - 98px)', background: '#efefef', width: openImageDrawer || isOpenCircuitView ? '100vw' : '' }}>
        <div style={{ padding: '0 0 14px 14px' }}>
          <div style={{ padding: '16px', width: '200px', height: '100%', background: '#fff', borderRadius: '4px' }}>
            {formSectionNames.map((name, index) => (
              <SectionTab isActive={activeSectionName === name} onClick={() => changeSection(name)} key={name} title={name === 'SUB-COMPONENTS' ? "SUB-COMPONENTS (OCP'S)" : name} top={30 * index + 175} />
            ))}
          </div>
        </div>
        <div onScroll={handleScroll} ref={scrollableDiv} className='table-responsive dashboardtblScroll d-flex' id='style-1' style={{ height: 'calc(100% - 14px)', width: openImageDrawer || isOpenCircuitView ? '74vw' : '' }}>
          <div style={{ padding: '0 10px 10px 10px', width: '100%' }}>
            <div ref={formDiv} style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
              <input ref={uploadRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
              {/* basic info */}
              <FormSection id='basic-info' title='BASIC INFO' keepOpen>
                <MinimalInput value={get(asset, 'assetName', '') || ''} onChange={value => handleInputChange('assetName', value)} error={error.assetName} label='Asset Name' placeholder='Add Asset Name' onFocus={() => setError({ ...error, assetName: null })} baseStyles={{ marginRight: 0 }} />
                <PhotosSection label='Asset Photos' type={photoTypes.profile} />
                <div className='d-flex pt-3'>
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
                    isDisabled={isAddingExisting || viewObj.isWoLineForExisitingAsset || isMainAsset}
                    components={{ Option: CustomOptions }}
                  />
                </div>
                <div className='d-flex'>
                  <input ref={uploadQrRef} type='file' style={{ display: 'none' }} onChange={uploadQR} />
                  <MinimalInput value={get(asset, 'qrCode', '') || ''} onChange={value => handleInputChange('qrCode', value)} label='QR Code' placeholder='Add QR code' w={98} disabled={isAddingExisting} />
                  <FloatingButton isLoading={isQRUploading} tooltip='UPLOAD QR' onClick={handleQrUpload} icon={<CropFreeIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginTop: '18px' }} disabled={isAddingExisting || viewObj.isWoLineForExisitingAsset || isMainAsset} />
                </div>
                <MinimalTextArea rows={3} value={get(asset, 'backOfficeNote', '') || ''} onChange={e => handleInputChange('backOfficeNote', e.target.value)} placeholder='Add Back Office Note ..' label='Back Office Note' w={100} baseStyles={{ marginBottom: 0 }} />
                {/* <PhotosSection label='Exterior Photos' type={photoTypes.exterior} /> */}
              </FormSection>
              {/* nameplate photos */}
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
                            />
                            {/* <MinimalAutoComplete key={d} value={get(nameplateInformation, [d, 'value'], '')} onChange={value => handleChange(d, value)} label={startCase(d)} options={nameplateInformation[d]['options']} placeholder={`Select ${startCase(d)}`} isClearable baseStyles={{ marginRight: 0 }} /> */}
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

                {/* <PhotosSection label='Nameplate Photos' type={photoTypes.nameplate} /> */}
                {!isEmpty(assetClassCode) && (
                  <>
                    <div className='d-flex justify-content-between'>
                      <div className='text-bold mt-2'>Nameplate Photos</div>
                      <div>
                        {hasNameplateImage && !isEmpty(assetClassCode) && <MinimalButton variant='contained' color='primary' text='View Nameplate Image' onClick={() => handleNameplateInfo()} baseClassName='mr-2 ' disabled={imageDrawerLoading} />}
                        <AssetImageUploadButton loading={isPhotoUploading && uploadingPhotoType.type === photoTypes.nameplate && uploadingPhotoType.duration === 0} disabled={isPhotoUploading} onClick={() => handleUpload({ type: photoTypes.nameplate, duration: 0 })} />
                      </div>
                    </div>
                    {!isEmpty(photoError) && photoErrorType === photoTypes.nameplate && <span style={{ fontWeight: 800, color: 'red', marginLeft: 0 }}>{photoError}</span>}
                    {!isEmpty(uploadedImages.filter(d => d.assetPhotoType === photoTypes.nameplate)) && (
                      <div className='pt-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                        {uploadedImages
                          .filter(d => d.assetPhotoType === photoTypes.nameplate && (d.imageDurationTypeId === 0 || d.imageDurationTypeId === null))
                          .map((d, index) => !d.isDeleted && <AssetImage onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.url}`} randomValue onClick={() => (setPreview([true, photoTypes.nameplate]), setImageOrder(index))} />)}
                      </div>
                    )}
                  </>
                )}
              </FormSection>
              {/* component */}
              <FormSection id={isTopLevelComponent ? 'sub-components' : 'top-level-component'} title={isTopLevelComponent ? "SUB-COMPONENTS (OCP's)" : 'TOP LEVEL COMPONENT'} keepOpen>
                {/* <MinimalButtonGroup label='Type' value={componentType} onChange={value => handleComponentTypeChange(value)} options={componentTypeOptions} w={100} baseStyles={{ marginRight: 0 }} /> */}

                {!componentType ? (
                  ''
                ) : isTopLevelComponent ? (
                  get(assetClassCode, 'is_allowed_subcomponent', false) === true ? (
                    <>
                      <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                        <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                          {subComponentIssuesColumns.map(({ label, width }) => (
                            <div key={label} className='text-bold' style={{ width }}>
                              {label}
                            </div>
                          ))}
                        </div>
                        {subComponentList.map(({ name, classData, circuit, npPhoto, id, error, wolineSublevelcomponentMappingId, subcomponentImageList, lineLoadSideId }, index) => (
                          <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                            <MinimalInput w={30} value={name} onChange={value => handleComponentRowChange('name', value, id)} placeholder='Enter Name' baseStyles={{ margin: 0, marginRight: '8px' }} error={error.name} disabled={!isEmpty(wolineSublevelcomponentMappingId)} onFocus={() => handleErrorSubComponent('name', id)} />
                            <MinimalAutoComplete
                              placeholder='Select Class'
                              value={classData}
                              onChange={v => handleComponentRowChange('classData', v, id)}
                              options={filter(classCodeOptions, { is_allowed_to_create_subcomponent: true })}
                              isClearable
                              w={30}
                              components={{ Option: CustomOptionsForSubComponent }}
                              onFocus={() => handleErrorSubComponent('classData', id)}
                              baseStyles={{ marginBottom: 0 }}
                              error={error.classData}
                              isDisabled={!isEmpty(wolineSublevelcomponentMappingId)}
                            />
                            <MinimalInput w={30} value={circuit} onChange={value => handleComponentRowChange('circuit', value, id)} placeholder='Enter Circuit(s)' baseStyles={{ margin: isEmpty(npPhoto) ? 0 : '0 8px 0 0' }} />
                            {get(classData, 'is_line_load_side_allowed', false) === true ? <MinimalToggleButton isCheck={lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE} onChange={() => handleCheckLine(id, lineLoadSideId)} /> : <span style={{ width: '53px' }}></span>}
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
                  <MinimalAutoComplete value={topLevelComponent} onChange={value => handleChangeInSelectedTopLevelComponent(value)} loading={initialLoading} placeholder='Top Level Component' options={topLevelComponentOptions} label='Select Top Level Component' isClearable w={100} />
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
                      <MinimalButton variant='contained' color='primary' text='View Panel Schedule' onClick={() => (setIsOpenCircuitView(true), setOpenImageDrawer(false), parentDrawer(true))} baseClassName='my-2' />
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
                      <MinimalInput value={get(asset, 'building', '') || ''} onChange={value => handleInputChange('building', value)} label='Building' placeholder='Add Building' w={50} />
                      <MinimalInput value={get(asset, 'floor', '') || ''} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add Floor' w={50} baseStyles={{ marginRight: 0 }} />
                    </>
                  )}
                </div>
                <div className='d-flex'>
                  {!isInstalling ? (
                    <MinimalAutoComplete options={roomOptions} value={get(asset, 'room', '')} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add Room' w={50} isDisabled={!isTopLevelComponent} isClearable error={error.room} onFocus={() => setError({ ...error, room: null })} />
                  ) : (
                    <MinimalInput value={get(asset, 'room', '') || ''} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add Room' w={50} />
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
              </FormSection>
              {/* others */}
              <FormSection id='other' title='OTHER' keepOpen baseMargin>
                <MinimalTextArea rows={3} value={get(asset, 'otherNotes', '') || ''} onChange={e => handleInputChange('otherNotes', e.target.value)} placeholder='Add comments here ..' label='Other Comments' w={100} />
              </FormSection>
            </div>
            {/* white space */}
            <div style={{ height: '175px' }}></div>
          </div>
        </div>
        {/* image details */}
        {isOpenCircuitView && <ViewTampCircuit onClose={() => (setOpenImageDrawer(false), parentDrawer(false), setIsOpenCircuitView(false))} dataList={get(viewObj, 'feedingCircuitList', [])} nameplate={nameplateInformation} issues />}
        {openImageDrawer && (
          <>
            <div className='table-responsive d-flex' id='style-1' style={{ height: 'calc(100vh - 225px)' }}>
              <div style={{ padding: '0 10px', width: '51vw' }}>
                <div style={{ background: '#fff', borderRadius: '4px', height: 'calc(100vh - 240px)' }} className='table-responsive' id='style-1'>
                  <div className='d-flex justify-content-between align-items-center' style={{ padding: '6px 10px', borderRadius: '4px 4px 0 0', borderBottom: '1px solid #dee2e6' }}>
                    <strong style={{ fontSize: '14px' }}>NAMEPLATE IMAGE DETAILS</strong>
                    <div className='d-flex'>
                      {hideFillButton && <MinimalButton variant='contained' color='primary' text='Fill All' baseClassName='mr-2' onClick={handleFillAll} />}
                      {!imageDrawerLoading && (
                        <IconButton aria-label='close' size='small'>
                          <RefreshOutlinedIcon style={{ cursor: 'pointer' }} onClick={() => handleNameplateInfo()} />
                        </IconButton>
                      )}
                      <IconButton aria-label='close' size='small' onClick={() => (setOpenImageDrawer(false), parentDrawer(false))}>
                        <CloseIcon style={{ cursor: 'pointer' }} />
                      </IconButton>
                    </div>
                  </div>
                  {imageDrawerLoading ? (
                    <div className='d-flex justify-content-center align-items-center ml-3' style={{ height: 'calc(100vh - 270px)' }}>
                      <CircularProgress size={40} thickness={5} />
                    </div>
                  ) : isEmpty(namePlateJson) ? (
                    <div className='d-flex justify-content-center align-items-center text-bold' style={{ height: 'calc(100vh - 290px)' }}>
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
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <div>
          <MinimalButton variant='contained' color='default' text='Cancel' onClick={closeForm} />
          <MinimalButton variant='contained' color='default' text='Previous' onClick={handleOnPrevious} baseClassName='ml-2' />
        </div>
        <MinimalButton variant='contained' color='primary' text='Next' onClick={() => validateForm(enums.woTaskStatus.Open)} />
      </div>
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={uploadedImages.filter(d => d.assetPhotoType === isPreviewOpen[1] && !d.isDeleted)} urlKey='url' />}
      {isCreateFedByOpen && <CreateFedBy asset={asset} obj={viewObj} open={isCreateFedByOpen} onClose={() => setCreateFedByOpen(false)} afterSubmit={createFedBy} classCodeOptions={classCodeOptions} woId={workOrderID} isInstalling={isInstalling} />}
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

      {/* Line/load side */}
      <DialogPrompt
        title={`${changeLineSide[2] ? 'Remove' : 'Assign'} Line-Side Component`}
        text={changeLineSide[2] ? 'Are you sure you want to Remove this sub-component (OCP) as a Line-Side component?' : 'Are you sure you want to Assign this sub-component (OCP) as a Line-Side component? The current Line-Side component will be converted to a Load-Side component. Please confirm!'}
        open={changeLineSide[0]}
        ctaText={`${changeLineSide[2] ? 'Remove' : 'Confirm'}`}
        action={() => handleChangeLineSide(changeLineSide[1])}
        handleClose={() => setChangeLineSide([false, null, false])}
      />
    </>
  )
}

export default InstallAssetForMaintenance
