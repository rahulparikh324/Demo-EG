import React, { useState, useEffect, useRef } from 'react'
import useFetchData from 'hooks/fetch-data'

import editAssetDetails from 'Services/Asset/edit-asset'
import updateAssetInfo from 'Services/Asset/updateAssetInfo'
import getNamePlateInfoByAssetID from 'Services/Asset/getNamePlateInfoByAssetID.js'
import uploadQrCodeImage from 'Services/WorkOrder/upload-qr'
import CropFreeIcon from '@material-ui/icons/CropFree'
import assetClass from 'Services/FormIO/asset-class'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import locations from 'Services/locations'
import assetClassCodeOpt from 'Services/WorkOrder/asset-class'
import assetDetail from 'Services/Asset/assetDetailService'

import { Toast } from 'Snackbar/useToast'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle, FormAccordian } from 'components/Maintainance/components'
import { MinimalInput, MinimalStatusSelector, MinimalAutoComplete, MinimalDatePicker, MinimalTextArea, MinimalPhoneInput, MinimalToggleButton } from 'components/Assets/components'
import { MinimalButton, MinimalButtonGroup, FloatingButton } from 'components/common/buttons'
import CircularProgress from '@material-ui/core/CircularProgress'
import { components } from 'react-select'

import { snakifyKeys, camelizeKeys } from 'helpers/formatters'
import { validateAssetDetails } from './validations'
import { isEmpty, startCase, omit, get, differenceBy, filter, orderBy } from 'lodash'
import {
  conditionOptions,
  criticalityOptions,
  thermalClassificationOptions,
  locationOptions,
  physicalConditionOptions,
  codeComplianceOptions,
  sectionNames,
  SectionTab,
  componentTypeOptions,
  subComponentColumns,
  fedByTypeOptions,
  racewayTypesOptions,
  conductorTypesOptions,
  photoTypes,
  PanelOptions,
  maintenanceOptions,
  arcFlashOptionsName,
  subComponentPosition,
  connectionType,
  materialNonFlexType,
  conductorSizeOptions,
} from 'components/WorkOrders/onboarding/utils'
import ImagePreview from 'components/common/image-preview'
import { AssetImage, AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'
import enums from 'Constants/enums'
import uploadImage from 'Services/Asset/upload-image'
import { FormSection, LabelVal, PopupModal } from 'components/common/others'

import RemoveIcon from '@material-ui/icons/Remove'
import AddAPhotoOutlinedIcon from '@material-ui/icons/AddAPhotoOutlined'
import { useTheme } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import { AssetSubComponentMultiplePhotoPop } from './sub-component-multiphoto'
import $ from 'jquery'
import { MAX_IMG_UPLOAD } from 'components/Assets/tree/constants'
import DialogPrompt from 'components/DialogPrompt'
import AddGroup from 'components/Health/add-group'
import health from 'Services/health'
import { EditOutlined } from '@material-ui/icons'

const styles = {
  fedbySectionDrpInputStyle: { fontSize: '12px', background: 'none', padding: '0.7px 6px', border: '1px solid #a1a1a1' },
}

function EditAssetForm({ open, onClose, name, indexes, status, refetch, assetId, setAssetStatus, editType, isNew, mainListEdit, nodePosition, downStreamData, isLoadLineSide = false }) {
  // const assetInfo = camelizeKeys(assetDetails)
  const [assetInfo, setAssetInfo] = useState([])
  const [nameplateLoading, setNameplateLoading] = useState(false)
  const [nameplateInfo, setNameplateInfo] = useState([])
  const [loading, setLoading] = useState(false)
  const [assetStatus, setStatus] = useState(status === 3 ? 'ACTIVE' : 'INACTIVE')
  const [criticalityIndex, setcriticalityIndex] = useState(enums.CRITICALITY.LOW)
  const [conditionIndex, setConditionIndex] = useState(enums.CONDITION.GOOD)
  const [panelSchedule, setPanelSchedule] = useState(null)
  const [maintenanceIndexType, setMaintenanceIndexType] = useState(null)
  const [detailErrors, setDetailErrors] = useState({})
  const [selectedAsset, setSelectedAsset] = useState([])
  const [AssetOptions, setAssetOptions] = useState([])
  const [assetClassCode, setClassCode] = useState(null)
  const [details, setDetails] = useState({ assetName: name, assetId, section: get(assetInfo, 'assetLocationHierarchy.formioSectionName', '') })
  const [date, setDate] = useState(null)
  const [visualInspectionDate, setVisualInspectionDate] = useState(null)
  const [mechanicalInsepctionDate, setMechanicalInsepctionDate] = useState(null)
  const [electricalInsepctionDate, setElectricalInsepctionDate] = useState(null)
  const [infraredInsepctionDate, setInfraredInsepctionDate] = useState(null)
  const [arcFlashStudyDate, setArcFlashStudyDate] = useState(null)
  const [thermalClassification, setThermalClassification] = useState(null)
  const [lastPerformedDates, setLastPerformedDates] = useState({})
  const uploadQrRef = useRef(null)
  const [isQRUploading, setQRUploading] = useState(false)
  const [qrString, setQrString] = useState('')
  const [location, setLocation] = useState(null)
  const [physicalCondition, setPhysicalCondition] = useState(null)
  const [codeCompliance, setCodeCompliance] = useState(codeComplianceOptions[0].value)
  const [assetExpectedUsefullLife, setAssetExpectedUsefullLife] = useState(0)
  const [nameplateInformation, setNameplateInformation] = useState({})
  const [nameplateFetching, setNameplateFetching] = useState(true)
  const [isPreviewOpen, setPreview] = useState(false)
  const [imageOrder, setImageOrder] = useState(0)
  // if its sub component
  const [topLevelAssetOptions, setTopLevelAssetOptions] = useState([])
  const [topLevelComponent, setTopLevelComponent] = useState(null)
  const [topLevelOptsLoading, setTopLevelOptsLoading] = useState(true)
  const [subComponentList, setSubComponentList] = useState([])
  const uploadSubComponentPhotoRef = useRef([])
  uploadSubComponentPhotoRef.current = subComponentList.map((element, i) => uploadSubComponentPhotoRef.current[i] ?? React.createRef())
  const [isSubComponentPopupOpen, setSubComponentPopupOpen] = useState(false)
  const [subComponentPhotoInfo, setSubComponentPhotoInfo] = useState({})
  // locations
  const [locationOptsLoading, setLocatonOptsLoading] = useState(true)
  const [buildingOptions, setBuildingOptions] = useState([])
  const [floorOptions, setFloorOptions] = useState([])
  const [roomOptions, setRoomOptions] = useState([])

  const uploadPhotosRef = useRef(null)
  const [isPhotoUploading, setPhotoUploading] = useState(false)
  const [photoErrorType, setPhotoErrorType] = useState('')
  const [error, setError] = useState({})
  const [assetImages, setAssetImages] = useState([])
  const [random, setRandom] = useState()

  const [componentType, setComponentType] = useState(enums.COMPONENT_TYPE.TOP_LEVEL)
  const formSectionNames = sectionNames(true, componentType === enums.COMPONENT_TYPE.SUB_COMPONENT, true)
  const [activeSectionName, setActiveSectionName] = useState(formSectionNames[0])

  // fed by
  const [fedByList, setFedByList] = useState([])
  const [mainSubOtions, setMainSubOptions] = useState([])
  const [assetSubComponentOptions, setAssetSubComponentOptions] = useState([])
  const [classCodeOptions, setClassCodeOptions] = useState([])
  const [includedFedBy, setIncludedFedBy] = useState([])

  const [isShowPanel, setShowPanel] = useState(false)
  const [arcFlashLabelValid, setArcFlashLabelValid] = useState(null)
  const [namePlateJson, setNamePlateJson] = useState(null)
  const [hideFillButton, setHideFillButton] = useState(false)
  const [imageDrawerLoading, setImageDrawerLoading] = useState(false)
  const [openImageDrawer, setOpenImageDrawer] = useState(false)
  const [changeLineSide, setChangeLineSide] = useState([false, null, false])
  const [subComponentAsset, setSubComponentAsset] = useState([])
  const [lineLoadSidePosition, setLineLoadSidePosition] = useState(isLoadLineSide ? get(downStreamData, 'lineLoadSideId', null) : null)

  const [assetGroup, setAssetGroup] = useState(null)
  const [isOpenAddDrawer, setOpenAddDrawer] = useState(false)
  const [selectedAssetGroup, setSelectedAssetGroup] = useState(null)

  //edges changes
  const [isExistingFedByOpen, setExistingFedByOpen] = useState([false, false, null])
  const [conductorJson, setConductorJson] = useState([{ amount: 1, material: 'Copper', size: conductorSizeOptions[0], id: 0 }])
  const [diaMeter, setDiaMeter] = useState(1)
  const [length, setLength] = useState(50)
  const [sets, setSets] = useState(1)
  const [connectType, setConnectType] = useState(connectionType[0].value)
  const [material, setMaterial] = useState(materialNonFlexType[0].value)
  const [topLevelAsset, setTopLevelAsset] = useState([])
  const [subLevelAsset, setSubLevelAsset] = useState([])
  const [subComponentAssetOptions, setSubComponentAssetOptions] = useState([])

  useEffect(() => {
    if (isExistingFedByOpen[2] === null) {
      if (connectType === 1) setMaterial(materialNonFlexType[0].value)
      if (connectType === 2) setMaterial(materialNonFlexType[4].value)
    }
  }, [connectType])

  const isTopLevelComponent = componentType === enums.COMPONENT_TYPE.TOP_LEVEL
  const scrollableDiv = useRef(null)
  const formDiv = useRef(null)
  const theme = useTheme()
  //

  const formatTopLevelHiararchy = data => {
    const mainList = get(data, 'toplevelMainAssets', []) || []
    const obList = get(data, 'toplevelObwoAssets', []) || []
    const mainOpts = mainList.map(asset => ({ ...asset, label: asset.assetName, value: asset.assetId }))
    const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
    const topComponentAsset = [...mainOpts, ...obOpts]

    const mainSub = get(data, 'subcomponentMainAssets', []) || []
    const obSub = get(data, 'subcomponentObwoAssets', []) || []
    const mainSubOpts = mainSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.assetId }))
    const obSubOpts = obSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.woonboardingassetsId, isOB: true }))
    const subComponentAsset = [...mainSubOpts, ...obSubOpts]

    setMainSubOptions(subComponentAsset)

    return { subComponentAsset, topComponentAsset }
  }
  useFetchData({ fetch: onBoardingWorkorder.fedBy.topSubHiararchyAssetList, formatter: d => formatTopLevelHiararchy(get(d, 'data', {})), defaultValue: [], condition: isNew })

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

  const { loading: assetGroupLoading, data: assetGroupData, reFetch: reFetchAssetGroup } = useFetchData({ fetch: health.getAssetGroupsDropdownList, formatter: d => sortAssetGroup(d), externalLoader: true })

  const updateAsset = async () => {
    setLoading(true)
    try {
      const status = assetStatus === 'ACTIVE' ? 3 : 4
      const payload = {
        ...details,
        assetId: !isNew ? assetId : null,
        componentLevelTypeId: componentType,
        inspectiontemplateAssetClassId: get(assetClassCode, 'value', ''),
        assetGroupId: get(assetGroup, 'value', null),
        criticalityIndexType: Number(criticalityIndex),
        conditionIndexType: Number(conditionIndex),
        status,
        parentAssetInternalId: get(selectedAsset, 'internalAssetId', ''),
        commisiionDate: date ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null,
        thermalClassificationId: get(thermalClassification, 'value', null),
        ...lastPerformedDates,
        qrCode: qrString,
        assetPlacement: location ? location : null,
        assetOperatingConditionState: get(physicalCondition, 'value', null),
        codeCompliance,
        assetExpectedUsefullLife: Number(assetExpectedUsefullLife),
        building: get(details, 'building.formioBuildingName', ''),
        floor: get(details, 'floor.formioFloorName', ''),
        room: get(details, 'room.formioRoomName', ''),
        assetProfileImages: assetImages,
        maintenanceIndexType,
        panelSchedule,
        arcFlashLabelValid,
        xAxis: Math.round(get(nodePosition, 'x', 0)),
        yAxis: isEmpty(downStreamData) ? Math.round(get(nodePosition, 'y', 0)) : Math.round(get(nodePosition, 'y', 0)) + 100,
        lineLoadTypeId: lineLoadSidePosition,
      }
      //nameplate
      const nameplateData = {}
      if (!isEmpty(nameplateInformation)) {
        Object.keys(nameplateInformation).forEach(key => {
          nameplateData[key] = nameplateInformation[key]['type'] === 'select' ? get(nameplateInformation[key], ['value'], null) : get(nameplateInformation[key], ['value'], '')
        })
      }
      payload.formRetrivedNameplateInfo = JSON.stringify(nameplateData)

      const fedByMapping = []
      const fedBys = []
      fedByList.forEach(d => {
        if (!isEmpty(d.fedBy)) fedBys.push(d)
      })
      const old = get(assetInfo, 'assetParentMappingList', [])
      if (!isEmpty(fedBys) || !isEmpty(old)) {
        fedBys.forEach(d => {
          const obj = old.find(x => x.parentAssetId === d.fedBy.value)
          fedByMapping.push({
            woObAssetFedById: get(obj, 'woObAssetFedById', null),
            parentAssetId: d.fedBy.value,
            woonboardingassetsId: get(assetInfo, 'woonboardingassetsId', null),
            isDeleted: false,
            // fedByUsageTypeId: d.type,
            // length: get(d, 'length', ''),
            // style: get(d, 'style', ''),
            // conductorTypeId: get(d, 'conductorType.value', 0),
            // numberOfConductor: parseInt(get(d, 'conductorName', 0)),
            // racewayTypeId: get(d, 'racewayType.value', 0),
            viaSubcomponentAssetId: d?.subComponentAsset?.isTemp === false ? get(d, 'subComponentAsset.sublevelcomponentAssetId', null) : null,
            viaSubcomponentAssetName: get(d, 'subComponentAsset.name', ''),
            viaSubcomponantAssetClassCode: get(d, 'subComponentAsset.classData.className', ''),
            fedByViaSubcomponantAssetId: get(d, 'ocp.value', null),
            assetParentHierrachyId: get(obj, 'assetParentHierrachyId', null),
            fedbyDetailsJson: get(d, 'fedbyDetailsJson', null),
          })
        })
        const deleted = differenceBy(old, fedByMapping, 'parentAssetId')
        deleted.forEach(d => fedByMapping.push({ ...d, isDeleted: true }))
      }
      payload.assetParentMappingList = fedByMapping

      // top level mapping
      payload.assetToplevelComponenent = null
      if (!isEmpty(topLevelComponent)) {
        payload.assetToplevelComponenent = {
          assetToplevelcomponentMappingId: get(assetInfo, 'assetToplevelComponenent.assetToplevelcomponentMappingId', '') || null,
          toplevelcomponentAssetId: get(topLevelComponent, 'assetId', null),
          toplevelcomponentAssetName: get(topLevelComponent, 'label', ''),
        }
      }
      // sub component mapping
      const subComponentMappings = []
      if (!isEmpty(subComponentList) || !isEmpty(get(assetInfo, 'assetSubcomponentsMappingList', []))) {
        subComponentList.forEach(sub => {
          subComponentMappings.push({
            assetSublevelcomponentMappingId: get(sub, 'assetSublevelcomponentMappingId', null),
            assetId: get(sub, 'assetId', null),
            sublevelcomponentAssetId: get(sub, 'sublevelcomponentAssetId', null),
            isDeleted: false,
            sublevelcomponentAssetName: sub.name,
            inspectiontemplateAssetClassId: get(sub, 'classData.value', null),
            circuit: sub.circuit,
            lineLoadSideId: get(sub, 'classData.is_line_load_side_allowed', false) === true ? get(sub, 'lineLoadSideId', null) : null,
            subcomponentassetImageList: get(sub, 'subcomponentassetImageList', []),
          })
        })
        const deletedSubComponents = differenceBy(get(assetInfo, 'assetSubcomponentsMappingList', []), subComponentMappings, 'assetSublevelcomponentMappingId')
        deletedSubComponents.forEach(d => subComponentMappings.push({ ...d, isDeleted: true }))
      }
      payload.assetSubcomponentsMappingList = isTopLevelComponent ? (get(assetClassCode, 'is_allowed_subcomponent', false) === true ? subComponentMappings : []) : []
      const isValid = await validateAssetDetails(payload)
      setDetailErrors(isValid)

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
      if (isValid === true && isEmpty(subComponentErrors)) {
        payload.formiobuildingId = details.building.value
        payload.formiofloorId = details.floor.value
        payload.formioroomId = details.room.value
        const res = await editAssetDetails(snakifyKeys(payload))
        if (res.success > 0) {
          if (isNew || mainListEdit) {
            refetch()
          } else {
            setAssetStatus(assetStatus)
          }
          Toast.success(isNew ? 'Asset created successfully !' : 'Asset updated successfully !')
        } else Toast.error(res.message)
        onClose()
        refetch()
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong')
      onClose()
    }
    setLoading(false)
  }

  // panel logic
  useEffect(() => {
    if (!isEmpty(assetClassCode)) {
      setShowPanel(get(assetClassCode, 'classType', '')?.includes('PANELS') ? true : false)
    }
  }, [assetClassCode])

  const handleChange = (key, value) => {
    const data = { ...nameplateInformation }
    data[key]['value'] = value
    setNameplateInformation(data)
  }
  const handleOnDetailInputChange = (value, name) => setDetails({ ...details, [name]: value })
  const handleDetailInputFocus = name => setDetailErrors({ ...detailErrors, [name]: null })

  const updateNameplateInfo = async () => {
    const nameplateData = {}
    if (!isEmpty(nameplateInformation)) {
      Object.keys(nameplateInformation).forEach(key => {
        nameplateData[key] = nameplateInformation[key]['type'] === 'select' ? get(nameplateInformation[key], ['value'], null) : get(nameplateInformation[key], ['value'], '')
      })
    }
    const payload = {
      formRetrivedNameplateInfo: JSON.stringify(nameplateData),
      criticalityIndex: Number(criticalityIndex),
      conditionIndex: Number(conditionIndex),
      commisiionDate: date !== null ? new Date(date.year, date.month - 1, date.day, 12).toISOString() : null,
      assetNamespateImages: assetImages,
      assetId,
    }
    setNameplateLoading(true)
    try {
      const response = await updateAssetInfo(snakifyKeys(payload))
      if (response.success > 0) {
        indexes.criticalIndex.set(Number(criticalityIndex))
        indexes.conditionIndex.set(Number(conditionIndex))
        Toast.success('Nameplate Info updated successfully !')
        refetch()
      } else Toast.error(response.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setNameplateLoading(false)
    onClose()
  }
  useEffect(() => {
    if (!isNew) {
      ;(async () => {
        try {
          $('#pageLoading').show()
          const assetDetailsData = await assetDetail({ asset_id: assetId })
          setAssetInfo(camelizeKeys(assetDetailsData.data.data))
          const assetInfo = camelizeKeys(assetDetailsData.data.data)
          if (editType === 'ASSET') {
            const classCodeData = await assetClassCodeOpt.getAllAssetClassCodes()
            const classOptions = filter(get(classCodeData, 'data', []), { is_allowed_toplevel: true })
            setClassCodeOptions(orderBy(classOptions, [e => e.className && e.className.toLowerCase()], ['asc']))
            let classCode = null
            classOptions.forEach(d => {
              if (!isEmpty(assetInfo.assetClassCode) && d.label.toLowerCase() === assetInfo.assetClassCode.toLowerCase()) classCode = d
            })
            setClassCode(classCode)
            setShowPanel(get(assetInfo, 'assetClassType', '')?.includes('PANELS') ? true : false)
            setMaintenanceIndexType(assetInfo.maintenanceIndexType)
            setLineLoadSidePosition(get(assetInfo, 'lineLoadTypeId', null))

            const assetNameOpts = await onBoardingWorkorder.fedBy.getList({})
            const mainList = get(assetNameOpts, 'data.mainAssetList', []) || []
            const mainOpts = mainList.filter(d => d.assetId !== assetId).map(asset => ({ ...asset, label: asset.name, value: asset.assetId }))
            const opts = orderBy([...mainOpts], [e => e.label && e.label?.toLowerCase()], ['asc'])
            setAssetOptions(opts)

            //feed parents
            if (!isEmpty(get(assetInfo, 'assetParentMappingList', []))) {
              const fedIDs = get(assetInfo, 'assetParentMappingList', []).map(d => d.parentAssetId)
              const fed = opts.filter(d => fedIDs.includes(d.assetId))
              setSelectedAsset(fed)
            }
            setArcFlashLabelValid(get(assetInfo, 'arcFlashLabelValid', null))

            setAssetExpectedUsefullLife(assetInfo.assetExpectedUsefullLife || 0)
            setLocation(parseInt(assetInfo.assetPlacement))
            if (assetInfo.assetOperatingConditionState) setPhysicalCondition(physicalConditionOptions.find(d => d.value === assetInfo.assetOperatingConditionState))
            setcriticalityIndex(indexes?.criticalIndex.value ?? assetInfo.criticalityIndexType)
            setConditionIndex(indexes?.conditionIndex.value ?? assetInfo.conditionIndexType)
            setQrString(get(assetInfo, 'qRCode', ''))
            setAssetImages(
              get(assetInfo, 'assetProfileImages', []).map(asset => {
                return {
                  ...asset,
                  imageUrl: asset.assetPhoto,
                }
              })
            )
            setCodeCompliance(get(assetInfo, 'codeCompliance', null))
            const dates = {}
            setThermalClassification(thermalClassificationOptions.find(d => d.value === assetInfo.thermalClassificationId))
            if (assetInfo.commisiionDate) {
              const _date = new Date(assetInfo.commisiionDate)
              setDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
            }
            if (assetInfo.visualInsepctionLastPerformed) {
              dates.visualInsepctionLastPerformed = assetInfo.visualInsepctionLastPerformed
              const _date = new Date(assetInfo.visualInsepctionLastPerformed)
              setVisualInspectionDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
            }
            if (assetInfo.infraredInsepctionLastPerformed) {
              dates.infraredInsepctionLastPerformed = assetInfo.infraredInsepctionLastPerformed
              const _date = new Date(assetInfo.infraredInsepctionLastPerformed)
              setInfraredInsepctionDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
            }
            if (assetInfo.electricalInsepctionLastPerformed) {
              dates.electricalInsepctionLastPerformed = assetInfo.electricalInsepctionLastPerformed
              const _date = new Date(assetInfo.electricalInsepctionLastPerformed)
              setElectricalInsepctionDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
            }
            if (assetInfo.mechanicalInsepctionLastPerformed) {
              dates.mechanicalInsepctionLastPerformed = assetInfo.mechanicalInsepctionLastPerformed
              const _date = new Date(assetInfo.mechanicalInsepctionLastPerformed)
              setMechanicalInsepctionDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
            }
            if (assetInfo.arcFlashStudyLastPerformed) {
              dates.arcFlashStudyLastPerformed = assetInfo.arcFlashStudyLastPerformed
              const _date = new Date(assetInfo.arcFlashStudyLastPerformed)
              setArcFlashStudyDate({ month: _date.getMonth() + 1, day: _date.getDate(), year: _date.getFullYear() })
            }

            // top level mapping
            if (assetInfo.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT) {
              setTopLevelOptsLoading(true)
              const res = await onBoardingWorkorder.component.getAssetsByLevel(snakifyKeys({ woId: null, componentLevelTypeId: enums.COMPONENT_TYPE.TOP_LEVEL }))
              const topLevelOpts = get(res, 'data.mainAssetsList', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
              setTopLevelAssetOptions(topLevelOpts)
              setTopLevelOptsLoading(false)
              if (!isEmpty(assetInfo.assetToplevelComponenent)) {
                const topL = topLevelOpts.find(d => d.assetId === get(assetInfo, 'assetToplevelComponenent.toplevelcomponentAssetId', ''))
                setTopLevelComponent(topL)
              }
            }
            setLastPerformedDates(dates)
            // locations
            setLocatonOptsLoading(true)
            const locs = await locations.get()
            const buildingOptions = get(locs, 'data.buildings', []).map(d => ({ ...d, label: d.formioBuildingName, value: d.formiobuildingId }))
            const building = buildingOptions.find(d => d.value === get(assetInfo, 'assetLocationHierarchy.formiobuildingId', ''))
            const floorOpts = get(building, 'floors', []).map(d => ({ ...d, label: d.formioFloorName, value: d.formiofloorId }))
            const floor = floorOpts.find(d => d.value === get(assetInfo, 'assetLocationHierarchy.formiofloorId', ''))
            const roomOpts = get(floor, 'rooms', []).map(d => ({ ...d, label: d.formioRoomName, value: d.formioroomId }))
            const room = roomOpts.find(d => d.value === get(assetInfo, 'assetLocationHierarchy.formioroomId', ''))
            setBuildingOptions(buildingOptions)
            setFloorOptions(floorOpts)
            setRoomOptions(roomOpts)
            setLocatonOptsLoading(false)
            setDetails({ ...details, building, floor, room, section: get(assetInfo, 'assetLocationHierarchy.formioSectionName', '') })
            // component
            setComponentType(assetInfo.componentLevelTypeId)

            // sub component
            if (!isEmpty(assetInfo.assetSubcomponentsMappingList)) {
              const subCompList = assetInfo.assetSubcomponentsMappingList.map((d, i) => ({
                ...d,
                id: i + 1,
                name: d.sublevelcomponentAssetName || '',
                classData: classOptions.find(cc => cc.value === d.sublevelcomponentAssetClassId),
                error: { name: null, classData: null },
                circuit: d.circuit,
                npPhoto: isEmpty(d.imageName) ? null : { fileUrl: d.imageUrl, filename: d.imageName },
                lineLoadSideId: get(d, 'lineLoadSideId', null),
                subcomponentassetImageList: get(d, 'subcomponentassetImageList', []),
              }))
              setSubComponentList(subCompList)
              // const ocpMain = orderBy(
              //   subCompList?.filter(val => !isEmpty(val.name)).map(d => ({ label: get(d, 'name', ''), value: get(d, 'sublevelcomponentAssetId', null) || null, classCode: get(d, 'classData.label', '') })),
              //   [e => e.label && e.label?.toLowerCase()],
              //   ['asc']
              // )

              // setAssetSubComponentOptions(ocpMain)
            }

            if (get(assetInfo, 'panelSchedule', null)) {
              const panel = PanelOptions.find(d => d.value === get(assetInfo, `panelSchedule`, null))
              setPanelSchedule(get(panel, 'value', null))
            }

            // fed by
            const subAssetOptions = get(assetInfo, 'assetSubcomponentsMappingList', []).map(d => ({ ...d, name: get(d, 'sublevelcomponentAssetName', ''), value: get(d, 'sublevelcomponentAssetId', ''), isSublevelcomponentFromObWo: get(d, 'isSublevelcomponentFromObWo', true), isTemp: false }))
            ;(async () => {
              try {
                const assetNameOpts = await onBoardingWorkorder.fedBy.topSubHiararchyAssetList()
                const mainList = get(assetNameOpts, 'data.toplevelMainAssets', []) || []
                const obList = get(assetNameOpts, 'data.toplevelObwoAssets', []) || []
                const mainOpts = mainList.map(asset => ({ ...asset, label: asset.assetName, value: asset.assetId }))
                const obOpts = obList.map(asset => ({ ...asset, label: asset.assetName, value: asset.woonboardingassetsId, isOB: true }))
                const options = [...mainOpts, ...obOpts]

                const mainSub = get(assetNameOpts, 'data.subcomponentMainAssets', []) || []
                const obSub = get(assetNameOpts, 'data.subcomponentObwoAssets', []) || []
                const mainSubOpts = mainSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.assetId }))
                const obSubOpts = obSub.map(sub => ({ ...sub, label: sub.assetName, value: sub.woonboardingassetsId }))
                const subOptions = [...mainSubOpts, ...obSubOpts]
                setMainSubOptions(subOptions)

                // const fedByRes = await onBoardingWorkorder.fedBy.getList({})
                // const mainfedByList = get(fedByRes, 'data.mainAssetList', []) || []
                // const mainFedOpts = mainfedByList.map(d => ({ ...d, label: d.name, value: d.assetId }))

                const fedIDs = []
                const fedByTypes = {}
                get(assetInfo, 'assetParentMappingList', []).forEach(d => {
                  fedIDs.push(d.parentAssetId)
                  fedByTypes[d.parentAssetId] = {
                    // type: d.fedByUsageTypeId,
                    // length: get(d, 'length', ''),
                    // style: get(d, 'style', ''),
                    ocp: d.fedByViaSubcomponantAssetId,
                    subComponentAsset: d.viaSubcomponentAssetId,
                    // conductorType: d.conductorTypeId,
                    // conductorName: get(d, 'numberOfConductor', ''),
                    // racewayType: d.racewayTypeId,
                    fedbyDetailsJson: d.fedbyDetailsJson,
                  }
                })
                const fed = options.filter(d => fedIDs.includes(d.value))
                const fedByList = []
                fed.forEach((d, index) => {
                  fedByList.push({
                    fedBy: { ...d, name: get(d, 'label', '') },
                    id: index + 1,
                    ocp: subOptions.find(val => val.value === get(fedByTypes, [d.value, 'ocp'], null)),
                    subComponentAsset: subAssetOptions.find(val => val.value === get(fedByTypes, [d.value, 'subComponentAsset'], null)),
                    fedbyDetailsJson: (() => {
                      try {
                        const json = get(fedByTypes, [d.value, 'fedbyDetailsJson'], null)
                        const parsedJson = JSON.parse(json)
                        return parsedJson && parsedJson.data ? JSON.stringify(parsedJson.data) : json
                      } catch (e) {
                        return null
                      }
                    })(),
                  })
                })
                // setSubComponentAsset(get(fedByList[0], 'subComponentAsset', []))
                setSubComponentAsset(subAssetOptions.find(d => d.lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE))
                setIncludedFedBy(fedByList.map(val => get(val, 'fedBy.value')))
                if (!isEmpty(fedByList)) setFedByList(fedByList)
              } catch (error) {
                console.log(error)
              }
            })()
          } else {
            setNameplateFetching(true)
            const nameplateTemplate = await assetClass.nameplateInfo.get({ id: assetInfo.inspectiontemplate_asset_class_id })
            const res = await getNamePlateInfoByAssetID(assetId)
            const info = JSON.parse(res.data.form_retrived_nameplate_info)
            const namePlateInfo = omit(info, ['pleaseSelectTests'])
            const parsed = JSON.parse(get(nameplateTemplate, 'data.formNameplateInfo', {}))
            const arr = []
            Object.keys(parsed).forEach(d => {
              let val = ''
              const value = isEmpty(get(namePlateInfo[d], ['value'], '')) ? namePlateInfo[d] : namePlateInfo[d]['value']
              // if (parsed[d]['type'] === 'select') {
              //   const v = get(parsed[d], ['options'], []).find(q => q.value === value)
              //   val = isEmpty(v) ? null : v
              // } else {
              val = value || ''
              // }
              arr.push({
                key: d,
                label: startCase(d),
                type: parsed[d]['type'],
                options: get(parsed[d], 'options', []),
                value: val,
              })
              parsed[d]['value'] = val
            })
            setNameplateInfo(arr)
            setNameplateInformation(parsed)
            setAssetImages(
              get(assetInfo, 'assetNameplateImages', []).map(asset => {
                return {
                  ...asset,
                  imageUrl: asset.fileUrl,
                }
              })
            )
            setNameplateFetching(false)
          }
          $('#pageLoading').hide()
        } catch (err) {
          setNameplateFetching(false)
          setAssetOptions([])
          console.log(err)
          $('#pageLoading').hide()
        }
      })()
    }
  }, [])

  useEffect(() => {
    if (isNew) {
      ;(async () => {
        const classCodeData = await assetClassCodeOpt.getAllAssetClassCodes()
        if (isLoadLineSide) {
          const classOptions = filter(get(classCodeData, 'data', []), { is_line_load_side_allowed: true })
          setClassCodeOptions(orderBy(classOptions, [e => e.className && e.className.toLowerCase()], ['asc']))
        } else {
          const classOptions = filter(get(classCodeData, 'data', []), { is_allowed_toplevel: true })
          setClassCodeOptions(orderBy(classOptions, [e => e.className && e.className.toLowerCase()], ['asc']))
        }

        const assetNameOpts = await onBoardingWorkorder.fedBy.getList({})
        const mainList = get(assetNameOpts, 'data.mainAssetList', []) || []
        const fedOpt = orderBy(
          mainList.map(d => ({ ...d, label: d.name, value: d.assetId })),
          [e => e.label && e.label?.toLowerCase()],
          ['asc']
        )
        setAssetOptions(fedOpt)

        if (!isEmpty(downStreamData) && !isEmpty(fedOpt) && !isLoadLineSide) {
          handleAddFedBy({ label: get(downStreamData, 'data.label', ''), value: get(downStreamData, 'id', null) })
        }

        // // top level mapping
        setTopLevelOptsLoading(true)
        const res = await onBoardingWorkorder.component.getAssetsByLevel(snakifyKeys({ woId: null, componentLevelTypeId: enums.COMPONENT_TYPE.TOP_LEVEL }))
        const topLevelOpts = get(res, 'data.mainAssetsList', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
        setTopLevelAssetOptions(topLevelOpts)
        setTopLevelOptsLoading(false)

        // location
        setLocatonOptsLoading(true)
        const locs = await locations.get()
        const buildingOptions = get(locs, 'data.buildings', []).map(d => ({ ...d, label: d.formioBuildingName, value: d.formiobuildingId }))
        const building = buildingOptions.find(d => d.value === get(assetInfo, 'assetLocationHierarchy.formiobuildingId', ''))
        const floorOpts = get(building, 'floors', []).map(d => ({ ...d, label: d.formioFloorName, value: d.formiofloorId }))
        const floor = floorOpts.find(d => d.value === get(assetInfo, 'assetLocationHierarchy.formiofloorId', ''))
        const roomOpts = get(floor, 'rooms', []).map(d => ({ ...d, label: d.formioRoomName, value: d.formioroomId }))
        const room = roomOpts.find(d => d.value === get(assetInfo, 'assetLocationHierarchy.formioroomId', ''))
        setBuildingOptions(buildingOptions)
        setFloorOptions(floorOpts)
        setRoomOptions(roomOpts)
        setLocatonOptsLoading(false)

        // fed by
        const subAssetOptions = orderBy(
          get(assetInfo, 'woObAssetSublevelcomponentMapping', []).map(d => ({ label: d.sublevelcomponentAssetName, value: d.sublevelcomponentAssetId, isSublevelcomponentFromObWo: d.isSublevelcomponentFromObWo })),
          [e => e.label && e.label.toLowerCase()],
          ['asc']
        )

        setAssetSubComponentOptions(subAssetOptions)
        // LineSide and load side
        if (isLoadLineSide) {
          setComponentType(enums.COMPONENT_TYPE.SUB_COMPONENT)
          const topLevelAsset = topLevelOpts.find(d => d.value === get(downStreamData, 'id', null))
          setTopLevelComponent(topLevelAsset)
        }
      })()
    }
  }, [])

  useEffect(() => {
    let assetGroup = null
    if (!isEmpty(assetGroupData) && assetInfo) {
      assetGroupData.forEach(d => {
        if (assetInfo?.assetGroupId !== null && !isEmpty(assetInfo?.assetGroupId) && d.value === assetInfo.assetGroupId) assetGroup = d
        if (selectedAssetGroup !== null && !isEmpty(selectedAssetGroup) && d.value === selectedAssetGroup) {
          assetGroup = d
        }
      })
    }
    setAssetGroup(assetGroup)
    setSelectedAssetGroup(null)
  }, [assetGroupData, assetInfo])

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
      else setQrString(qrData.data)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setQRUploading(false)
  }
  const title = name?.length > 40 ? `${name?.slice(0, 40)}...` : name

  //locations
  const handleBuildingChange = building => {
    const floorOpts = get(building, 'floors', []).map(d => ({ ...d, label: d.formioFloorName, value: d.formiofloorId }))
    setFloorOptions(floorOpts)
    setRoomOptions([])
    setDetails({ ...details, building, floor: null, room: null })
  }
  const handleFloorChange = floor => {
    const roomOpts = get(floor, 'rooms', []).map(d => ({ ...d, label: d.formioRoomName, value: d.formioroomId }))
    setRoomOptions(roomOpts)
    setDetails({ ...details, floor, room: null })
  }

  // photos
  const handleUpload = type => {
    setError({ ...error, photos: null })
    setPhotoErrorType(type)
    uploadPhotosRef.current && uploadPhotosRef.current.click()
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
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eps', 'heif', 'heic']
    files.forEach((file, index) => {
      const extension = file.name.split('.').slice(-1).pop().toLowerCase()
      if (!validExtensions.includes(extension)) {
        setError({ ...error, photos: { error: true, msg: 'Invalid Image format!' } })
        hasImgError = true
        return
      }
      formData.append('file', file)
      const reader = new FileReader()
      reader.onload = d => {
        if (!hasImgError && index === files.length - 1) {
          setError({ ...error, photos: null })
          uploadPhoto(formData, photoErrorType)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = null
  }

  const uploadPhoto = async (formData, type) => {
    setPhotoUploading(true)
    try {
      const res = await uploadImage.uploadAssetNameplateImage(formData)
      if (res.success) {
        if (!isEmpty(res.data.imageList)) {
          const imgList = res.data.imageList.map(d => {
            return {
              assetPhotoType: type,
              assetPhoto: d.filename,
              assetThumbnailPhoto: d.thumbnailFilename,
              isDeleted: false,
              assetProfileImagesId: null,
              fileUrl: d.fileUrl,
              thumbnailFileUrl: d.thumbnailFileUrl,
              imageUrl: d.fileUrl,
            }
          })
          setAssetImages([...assetImages, ...imgList])
        } else {
          Toast.error(res.message)
        }
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading image !')
    }
    setPhotoUploading(false)
  }
  const removeImage = image => {
    const images = [...assetImages]
    const imageToDelete = images.find(img => img.assetPhoto === image.assetPhoto)
    if (imageToDelete) {
      if (isEmpty(imageToDelete.assetProfileImagesId)) {
        const actualUploadedImageList = assetImages.filter(e => e !== imageToDelete)
        setAssetImages(actualUploadedImageList)
      } else {
        imageToDelete.isDeleted = true
        setAssetImages(images)
      }
    } else {
      setAssetImages(images)
    }
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

  // nameplate info
  useEffect(() => {
    if (!isEmpty(assetClassCode)) {
      ;(async () => {
        try {
          const res = await assetClass.nameplateInfo.get({ id: assetClassCode.value })
          const data = JSON.parse(get(res, `data.formNameplateInfo`, '{}'))
          const updated = JSON.parse(get(assetInfo, `formRetrivedNameplateInfo`, '{}'))
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

  // component
  const handleComponentTypeChange = type => {
    setComponentType(type)
    if (type === enums.COMPONENT_TYPE.TOP_LEVEL) {
      setTopLevelComponent(null)
    } else {
      if (!isEmpty(topLevelAssetOptions) && !isEmpty(assetInfo?.woObAssetToplevelcomponentMapping)) {
        const opt = topLevelAssetOptions.find(d => d.value === get(assetInfo, 'woObAssetToplevelcomponentMapping[0].toplevelcomponentAssetId', ''))
        setTopLevelComponent(opt)
      }
    }
  }
  const handleAddSubComponent = () => {
    const subComponent = { name: '', classData: null, error: { name: null, classData: null }, circuit: '', npPhoto: {}, id: subComponentList.length + 1, subcomponentassetImageList: [], isTemp: true, lineLoadSideId: null }
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
        if (val.subComponentAsset === removeSub.name) {
          return {
            ...val,
            subComponentAsset: [],
          }
        }
        return val
      })
      setFedByList(updatedFedByList)
    }
  }
  const handleSubComponentPhoto = item => {
    setSubComponentPhotoInfo(item)
    setSubComponentPopupOpen(true)
  }
  const keepPhoto = ({ data, id }) => {
    handleComponentRowChange('subcomponentassetImageList', data, id)
    setTimeout(() => setSubComponentPopupOpen(false), 500)
  }
  const handleErrorSubComponent = (name, id) => {
    const list = [...subComponentList]
    const current = list.find(d => d.id === id)
    current['error'][name] = null
    setSubComponentList(list)
  }

  useEffect(() => {
    if (!isEmpty(topLevelAssetOptions)) {
      const opt = topLevelAssetOptions.find(d => d.value === get(assetInfo, 'woObAssetToplevelcomponentMapping[0].toplevelcomponentAssetId', ''))
      setTopLevelComponent(opt)
    }
  }, [topLevelAssetOptions])

  // fedby
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

  const handleAddFedBy = data => {
    if (fedByList.map(d => d.fedBy.label).includes(data.label)) return
    const updatedFedBy = [...fedByList]
    const selectOcp = mainSubOtions.filter(val => val.toplevelcomponentAssetId === data.value)
    // const ocp = orderBy(
    //   subComponentList.filter(val => !isEmpty(val.name)).map(d => ({ label: get(d, 'name', ''), value: get(d, 'sublevelcomponentAssetId', null) || null, classCode: get(d, 'classData.label', ''), isSublevelcomponentFromObWo: get(d, 'isSublevelcomponentFromObWo', true) })),
    //   [e => e.label && e.label.toLowerCase()],
    //   ['asc']
    // )
    // setAssetSubComponentOptions(ocp)
    // const ocpMain = subComponentList.find(d => get(d, 'lineLoadSideId', null) === enums.SUB_COMPONENT_TYPE.LINE_SIDE)
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

    updatedFedBy.push({ fedBy: data, id: fedByList.length + 1, ocp: selectOcp[0], subComponentAsset, fedbyDetailsJson: JSON.stringify(fedJson) })
    setFedByList(updatedFedBy)
    setIncludedFedBy([...includedFedBy, get(data, 'value', null)])
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
  const handleSelectOptions = topId => {
    const subOptions = mainSubOtions.filter(val => val.toplevelcomponentAssetId === topId)
    return filter(subOptions, item => item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE)
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
  //   console.log(subComponentList)
  // }, [subComponentList])

  const hasNameplateImage = assetImages.some(d => d.assetPhotoType === 2 && !d.isDeleted)

  const handleNameplateInfo = async () => {
    setOpenImageDrawer(true)
    setImageDrawerLoading(true)
    setHideFillButton(false)
    setNamePlateJson(null)
    const payload = {
      assetClassCode: get(assetClassCode, 'label', ''),
      assetNameplateImagePaths: assetImages.filter(d => d.assetPhotoType === 2 && !d.isDeleted).map(d => d.imageUrl),
      woonboardingassetsId: get(assetInfo, 'woonboardingassetsId', null) ?? null,
      assetId: get(assetInfo, 'assetId', null) ?? null,
    }

    try {
      const res = await onBoardingWorkorder.namePlateJsonForm(payload)
      if (res.success > 0) {
        setNamePlateJson(JSON.parse(res.data.nameplateJson))
        setHideFillButton(true)
        const updatedImages = assetImages.map(d => {
          if (d.assetPhotoType === photoTypes.nameplate && !d.isDeleted) {
            return {
              ...d,
              imageExtractedJson: res.data.nameplateJson,
            }
          } else {
            return d
          }
        })
        setAssetImages(updatedImages)
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

  const filterOption = (options, inputValue) => {
    const { label, data } = options
    const isLabelMatch = label.toLowerCase().includes(inputValue.toLowerCase())
    const isClassNameMatch = data.className?.toLowerCase().includes(inputValue.toLowerCase())

    return isLabelMatch || isClassNameMatch
  }

  const handleAssetGroupChange = v => {
    setAssetGroup(v)
  }

  const handleAssetGroupCreated = async newAssetGroupId => {
    setSelectedAssetGroup(newAssetGroupId)
    reFetchAssetGroup()
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

  const handleCloseFedBy = () => {
    setExistingFedByOpen([false, false, null])
    setTopLevelAsset([])
    setSubLevelAsset([])
    setConductorJson([{ amount: 1, material: 'Copper', size: conductorSizeOptions[0], id: 0 }])
    setDiaMeter(1)
    setLength(50)
    setSets(1)
    setConnectType(connectionType[0].value)
    setMaterial(materialNonFlexType[0].value)
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
    }
    setIncludedFedBy([...includedFedBy, topLevelAsset[0].value])
    handleCloseFedBy()
  }

  //  const handleSubAsset = subAsset => {
  //     setSubLevelAsset(subAsset)

  //       const topLevel = topComponentAssetOptions?.filter(val => val.value === subAsset.toplevelcomponentAssetId)
  //       setTopLevelAsset(topLevel)
  //     }
  //   }

  return (
    <>
      {editType === 'ASSET' && (
        <Drawer anchor='right' open={open} onClose={onClose}>
          <FormTitle title={isNew ? 'Add New Asset' : 'Edit Asset'} closeFunc={onClose} style={{ width: '100%', minWidth: '700px' }} />
          <div className='d-flex' style={{ height: 'calc(100vh - 65px)', background: '#efefef', width: openImageDrawer ? '100vw' : '' }}>
            <div style={{ padding: '10px 0 10px 10px' }}>
              <div style={{ padding: '16px', width: '200px', height: '100%', background: '#fff', borderRadius: '4px' }}>
                {formSectionNames.map((name, index) => (
                  <SectionTab isActive={activeSectionName === name} onClick={() => changeSection(name)} key={name} title={name === 'SUB-COMPONENTS' ? "SUB-COMPONENTS (OCP'S)" : name} top={30 * index + 90} />
                ))}
              </div>
            </div>
            <div onScroll={handleScroll} ref={scrollableDiv} className='table-responsive d-flex' id='style-1' style={{ height: 'calc(100vh - 126px)', width: openImageDrawer ? '74vw' : '' }}>
              <div style={{ padding: '10px', width: '850px' }}>
                <div ref={formDiv} style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
                  {/* basic info */}
                  <FormSection id='basic-info' title='BASIC INFO' keepOpen>
                    <MinimalInput onFocus={() => handleDetailInputFocus('assetName')} error={detailErrors.assetName} value={details.assetName} onChange={value => handleOnDetailInputChange(value, 'assetName')} label='Asset Name' placeholder='Enter Asset Name' />
                    <>
                      <div className='d-flex justify-content-between'>
                        <span style={{ fontWeight: 800, marginTop: '4px' }}>Asset Photos</span>
                        <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === photoTypes.profile} disabled={isPhotoUploading} onClick={() => handleUpload(photoTypes.profile)} />
                      </div>
                      {!isEmpty(error.photos) && photoErrorType === photoTypes.profile && <div style={{ fontWeight: 800, color: 'red', margin: '5px 0' }}>{error.photos.msg}</div>}
                      <input ref={el => (uploadPhotosRef.current = el)} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
                      {!isEmpty(assetImages.filter(d => d.assetPhotoType === photoTypes.profile)) && (
                        <div className='py-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                          {assetImages
                            .filter(d => d.assetPhotoType === photoTypes.profile)
                            .map((d, index) => d.assetPhotoType === photoTypes.profile && !d.isDeleted && <AssetImage onClick={() => (setPreview([true, photoTypes.profile]), setImageOrder(index))} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.imageUrl}?value=${random}`} randomValue />)}
                        </div>
                      )}
                    </>
                    <MinimalAutoComplete
                      placeholder='Select Class'
                      value={assetClassCode}
                      error={detailErrors.inspectiontemplateAssetClassId}
                      onChange={setClassCode}
                      options={classCodeOptions}
                      label='Asset Class'
                      isClearable
                      w={100}
                      onFocus={() => handleDetailInputFocus('inspectiontemplateAssetClassId')}
                      isDisabled={!isNew}
                      components={{ Option: CustomOptions }}
                      filterOption={filterOption}
                    />
                    <div className='d-flex'>
                      <input ref={uploadQrRef} type='file' style={{ display: 'none' }} onChange={uploadQR} />
                      <MinimalInput value={qrString} onChange={value => setQrString(value)} label='QR Code' placeholder='Add QR code' w={98} />
                      <FloatingButton isLoading={isQRUploading} tooltip='Upload QR' onClick={handleQrUpload} icon={<CropFreeIcon fontSize='small' />} style={{ color: '#fff', width: '42px', height: '42px', marginTop: '18px' }} />
                    </div>
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

                  {/* NamePlate information */}
                  <FormSection id='nameplate-information' title='NAMEPLATE INFORMATION' keepOpen>
                    <MinimalDatePicker date={date} setDate={setDate} label='Commission Date' w={97} />
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

                    {!isEmpty(assetClassCode) && (
                      <>
                        <div className='d-flex justify-content-between'>
                          <span style={{ fontWeight: 800 }}>Nameplate Photos</span>
                          <div>
                            {hasNameplateImage && !isEmpty(assetClassCode) && <MinimalButton variant='contained' color='primary' text='View Nameplate Image' onClick={() => handleNameplateInfo()} baseClassName='mr-2 ' disabled={imageDrawerLoading} />}
                            <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 2} disabled={isPhotoUploading} onClick={() => handleUpload(2)} />
                          </div>
                        </div>
                        {!isEmpty(error.photos) && photoErrorType === 2 && <div style={{ fontWeight: 800, color: 'red', margin: '5px 0' }}>{error.photos.msg}</div>}
                        <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} />
                        {!isEmpty(assetImages.filter(d => d.assetPhotoType === 2)) && (
                          <div className='py-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                            {assetImages.filter(d => d.assetPhotoType === 2).map((d, index) => d.assetPhotoType === 2 && !d.isDeleted && <AssetImage onClick={() => (setPreview([true, 2]), setImageOrder(index))} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.imageUrl}?value=${random}`} randomValue />)}
                          </div>
                        )}
                      </>
                    )}
                  </FormSection>
                  {/* component */}
                  <FormSection id='components' title='COMPONENTS' keepOpen>
                    {isNew && isEmpty(downStreamData) && !isLoadLineSide && get(assetClassCode, 'is_allowed_to_create_subcomponent', false) === true && <MinimalButtonGroup label='Type' value={componentType} onChange={value => handleComponentTypeChange(value)} options={componentTypeOptions} w={100} baseStyles={{ marginRight: 0 }} />}
                    {!componentType ? (
                      ''
                    ) : isTopLevelComponent ? (
                      get(assetClassCode, 'is_allowed_subcomponent', false) === true ? (
                        <>
                          <div className='text-bold text-sm'>Sub Components (OCP's)</div>
                          <div style={{ border: '1px solid #a1a1a1', borderRadius: '4px', width: '100%' }}>
                            <div className='d-flex align-items-center p-2 ' style={{ borderBottom: '1px solid #a1a1a1' }}>
                              {subComponentColumns.map(({ label, width }) => (
                                <div key={label} className='text-bold' style={{ width }}>
                                  {label}
                                </div>
                              ))}
                            </div>
                            {subComponentList.map(({ name, classData, circuit, npPhoto, id, error, assetProfileImagesId, subcomponentassetImageList, assetSublevelcomponentMappingId, lineLoadSideId }, index) => (
                              <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                                <MinimalInput w={28} value={name} onChange={value => handleComponentRowChange('name', value, id)} placeholder='Enter Name' baseStyles={{ margin: 0, marginRight: '8px' }} error={error.name} disabled={!isEmpty(assetSublevelcomponentMappingId)} onFocus={() => handleErrorSubComponent('name', id)} />
                                <MinimalAutoComplete
                                  placeholder='Select Class'
                                  value={classData}
                                  onChange={v => handleComponentRowChange('classData', v, id)}
                                  options={filter(classCodeOptions, { is_allowed_to_create_subcomponent: true })}
                                  isClearable
                                  w={28}
                                  components={{ Option: CustomOptionsForSubComponent }}
                                  onFocus={() => handleErrorSubComponent('classData', id)}
                                  baseStyles={{ marginBottom: 0 }}
                                  error={error.classData}
                                  isDisabled={!isEmpty(assetSublevelcomponentMappingId)}
                                  filterOption={filterOption}
                                />
                                <MinimalInput w={24} value={circuit} onChange={value => handleComponentRowChange('circuit', value, id)} placeholder='Enter Circuit(s)' baseStyles={{ margin: isEmpty(npPhoto) ? 0 : '0 8px 0 0' }} />
                                {get(classData, 'is_line_load_side_allowed', false) === true ? <MinimalToggleButton isCheck={lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE} onChange={() => handleCheckLine(id, lineLoadSideId)} /> : <span style={{ width: '53px' }}></span>}
                                <FloatingButton onClick={() => handleSubComponentPhoto({ id, assetProfileImagesId, subcomponentassetImageList })} icon={<AddAPhotoOutlinedIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
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
                          Can't Add Components in this Asset Class
                        </div>
                      )
                    ) : (
                      <>
                        <MinimalAutoComplete placeholder='Select Top Level Component' value={topLevelComponent} onChange={setTopLevelComponent} isLoading={topLevelOptsLoading} options={topLevelAssetOptions} label='Top Level Component' w={100} />
                        {get(assetClassCode, 'is_line_load_side_allowed', false) === true && <MinimalButtonGroup label='Sub Component Position' value={lineLoadSidePosition} onChange={setLineLoadSidePosition} options={subComponentPosition} w={100} />}
                      </>
                    )}
                  </FormSection>
                  {/* ELECTRICAL CONNECTIONS */}
                  {isTopLevelComponent && (
                    <FormSection id='electrical-connections' title='ELECTRICAL CONNECTIONS' keepOpen>
                      <MinimalAutoComplete onFocus={() => handleDetailInputFocus('parentAsset')} placeholder='Select Fed-By' value={null} onChange={value => handleAddFedBy(value)} options={filter(AssetOptions, obj => !includedFedBy?.includes(obj.value))} label='Fed-By' error={detailErrors.parentAsset} />
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
                              <div key={id} style={{ border: '1px solid #dee2e6' }}>
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
                                  <MinimalAutoComplete options={assetSubComponentOptions} value={subComponentAsset} onChange={value => handleFedByOptionsChange(id, value, 'subComponentAsset')} label='OCP Main' placeholder='Select OCP Main' w={30} isClearable inputStyles={styles.fedbySectionDrpInputStyle} isDisabled />
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
                      <>
                        <div className='d-flex justify-content-between'>
                          <span style={{ fontWeight: 800, marginTop: '4px' }}>Panel Schedule Photos</span>
                          <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 1} disabled={isPhotoUploading} onClick={() => handleUpload(14)} />
                        </div>
                        {!isEmpty(error.photos) && photoErrorType === 14 && <div style={{ fontWeight: 800, color: 'red', margin: '5px 0' }}>{error.photos.msg}</div>}
                        <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
                        {!isEmpty(assetImages.filter(d => d.assetPhotoType === 14)) && (
                          <div className='py-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                            {assetImages.filter(d => d.assetPhotoType === 14).map((d, index) => d.assetPhotoType === 14 && !d.isDeleted && <AssetImage onClick={() => (setPreview([true, 14]), setImageOrder(index))} onRemove={() => removeImage(d)} key={`asset-image-${d.assetPhoto}`} url={`${d.imageUrl}?value=${random}`} randomValue />)}
                          </div>
                        )}
                      </>
                    </FormSection>
                  )}
                  {/* location */}
                  <FormSection id='location' title='LOCATION' keepOpen>
                    <div className='d-flex'>
                      <MinimalAutoComplete
                        isLoading={locationOptsLoading}
                        options={buildingOptions}
                        onFocus={() => handleDetailInputFocus('building')}
                        error={detailErrors.building}
                        value={details.building}
                        onChange={value => handleBuildingChange(value)}
                        label='Building'
                        disabled={assetInfo?.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT}
                        isClearable
                        w={50}
                      />
                      <MinimalAutoComplete
                        w={50}
                        isLoading={locationOptsLoading}
                        options={floorOptions}
                        onFocus={() => handleDetailInputFocus('floor')}
                        error={detailErrors.floor}
                        value={details.floor}
                        onChange={value => handleFloorChange(value)}
                        label='Floor'
                        disabled={assetInfo?.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT}
                        isClearable
                      />
                    </div>
                    <div className='d-flex'>
                      <MinimalAutoComplete
                        isLoading={locationOptsLoading}
                        options={roomOptions}
                        onFocus={() => handleDetailInputFocus('room')}
                        error={detailErrors.room}
                        value={details.room}
                        onChange={value => handleOnDetailInputChange(value, 'room')}
                        label='Room'
                        disabled={assetInfo?.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT}
                        isClearable
                        w={50}
                      />
                      <MinimalInput onFocus={() => handleDetailInputFocus('section')} error={detailErrors.section} value={details.section} onChange={value => handleOnDetailInputChange(value, 'section')} label='Section' w={50} placeholder='Enter Section' />
                    </div>
                    <MinimalButtonGroup label='Location' value={location} onChange={value => setLocation(value)} options={locationOptions} />
                  </FormSection>
                  {/* condition */}
                  <FormSection id='condition' title='CONDITION' keepOpen>
                    <MinimalStatusSelector _default value={assetStatus} onChange={setStatus} label='Status' />
                    <MinimalButtonGroup label='Condition of Maintenance' value={maintenanceIndexType} onChange={setMaintenanceIndexType} options={maintenanceOptions} />
                    <MinimalButtonGroup label='Operating Conditions' value={conditionIndex} onChange={setConditionIndex} options={conditionOptions} />
                    <MinimalButtonGroup label='Select Criticality' value={criticalityIndex} onChange={setcriticalityIndex} options={criticalityOptions} />
                    {isShowPanel && <MinimalButtonGroup label='Panel Schedule' value={panelSchedule} onChange={setPanelSchedule} options={PanelOptions} w={100} />}
                    <MinimalButtonGroup label='Arc Flash Label Valid' value={arcFlashLabelValid} onChange={setArcFlashLabelValid} options={arcFlashOptionsName} w={100} />
                    <MinimalAutoComplete value={physicalCondition} onChange={value => setPhysicalCondition(value)} placeholder='Select Condition' options={physicalConditionOptions} label='Asset Condition' isClearable />
                    <MinimalInput type='number' min={0} value={assetExpectedUsefullLife} onChange={setAssetExpectedUsefullLife} label='Expected Life' placeholder='Add expected life' />
                    <MinimalButtonGroup label='Code Compliance' value={codeCompliance} onChange={value => setCodeCompliance(value)} options={codeComplianceOptions} />
                    <MinimalAutoComplete placeholder='Select Thermal Classification' value={thermalClassification} onChange={v => setThermalClassification(v)} options={thermalClassificationOptions} label='Thermal Classification' isClearable />
                  </FormSection>
                </div>
              </div>
            </div>
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
          <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
            <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
            {editType === 'ASSET' && <MinimalButton variant='contained' text={isNew ? 'Add' : 'Save'} loadingText={isNew ? 'Adding...' : 'Updating...'} color='primary' onClick={updateAsset} loading={loading} disabled={loading} />}
          </div>
        </Drawer>
      )}
      {editType === 'NAMEPLATE' && (
        <Drawer anchor='right' open={open} onClose={onClose}>
          <FormTitle title={`Edit - ${title}`} closeFunc={onClose} style={{ width: '100%' }} />

          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 65px)', background: '#efefef', width: '540px' }}>
            {nameplateFetching && editType === 'NAMEPLATE' ? (
              <CircularProgress size={32} thickness={5} style={{ position: 'absolute', top: '50%', left: '50%' }} />
            ) : (
              !isEmpty(nameplateInfo) &&
              editType === 'NAMEPLATE' && (
                <div style={{ margin: '8px' }}>
                  <FormAccordian title='Nameplate Information' style={{ borderRadius: '4px', background: '#fff', marginTop: '8px' }} bg keepOpen>
                    <div style={{ borderRadius: '4px', margin: '8px', background: '#fff' }}>
                      <div style={{ padding: '8px 8px 8px 16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          {nameplateInfo.map(d => {
                            if (d.type === 'select') return <MinimalAutoComplete key={d.key} options={d.options} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={value => handleChange(d.key, value)} label={d.label} placeholder={`Select ${d.label}`} isClearable baseStyles={{ marginRight: 0 }} />
                            else if (d.type === 'textarea') return <MinimalTextArea key={d.key} rows={3} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={e => handleChange(d.key, e.target.value)} placeholder={`Add ${d.label}`} label={d.label} />
                            else if (d.type === 'phoneNumber') return <MinimalPhoneInput key={d.key} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={value => handleChange(d.key, value)} label={d.label} baseStyles={{ marginRight: 0 }} />
                            else return <MinimalInput key={d.key} value={get(nameplateInformation, [d.key, 'value'], '')} onChange={value => handleChange(d.key, value)} label={d.label} placeholder={`Add ${d.label}`} baseStyles={{ marginRight: 0 }} />
                          })}
                        </div>
                      </div>
                    </div>
                  </FormAccordian>
                  <FormAccordian title='Nameplate Photos' style={{ borderRadius: '4px', background: '#fff', marginTop: '8px' }} bg>
                    {!isEmpty(error.photos) && photoErrorType === 2 && <div style={{ fontWeight: 800, color: 'red', margin: '10px 16px' }}>{error.photos.msg}</div>}
                    <div className='p-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
                      <input ref={uploadPhotosRef} type='file' style={{ display: 'none' }} onChange={addPhoto} multiple />
                      <AssetImageUploadButton loading={isPhotoUploading && photoErrorType === 2} disabled={isPhotoUploading} onClick={() => handleUpload(2)} />
                      {!isEmpty(assetImages) && assetImages.map(d => !d.isDeleted && d.assetPhotoType === 2 && <AssetImage onRemove={() => removeImage(d)} key={`asset-image-${d.assetThumbnailPhoto}`} url={`${d.imageUrl}?value=${random}`} randomValue />)}{' '}
                    </div>
                  </FormAccordian>
                </div>
              )
            )}
          </div>
          <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
            <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
            {/* {editType === 'ASSET' && <MinimalButton variant='contained' text='Update Details' loadingText='Updating...' color='primary' onClick={updateAsset} loading={loading} disabled={loading} />} */}
            {editType === 'NAMEPLATE' && <MinimalButton variant='contained' text='Update Nameplate Information' loadingText='Updating...' color='primary' onClick={updateNameplateInfo} loading={nameplateLoading} disabled={nameplateLoading} />}
          </div>
        </Drawer>
      )}
      {isPreviewOpen[0] && <ImagePreview open={isPreviewOpen[0]} onClose={() => setPreview([false, 0])} imageIndex={imageOrder} images={assetImages.filter(d => d.assetPhotoType === isPreviewOpen[1] && !d.isDeleted)} urlKey='imageUrl' reFetch={() => setRandom(Math.random())} />}
      {isSubComponentPopupOpen && <AssetSubComponentMultiplePhotoPop savePhotos={keepPhoto} data={subComponentPhotoInfo} open={isSubComponentPopupOpen} onClose={() => setSubComponentPopupOpen(false)} />}
      {/* Line/load side */}
      {changeLineSide[0] && (
        <DialogPrompt
          title={`${changeLineSide[2] ? 'Remove' : 'Assign'} Line-Side Component`}
          text={changeLineSide[2] ? 'Are you sure you want to Remove this sub-component (OCP) as a Line-Side component?' : 'Are you sure you want to Assign this sub-component (OCP) as a Line-Side component? The current Line-Side component will be converted to a Load-Side component. Please confirm!'}
          open={changeLineSide[0]}
          ctaText={`${changeLineSide[2] ? 'Remove' : 'Confirm'}`}
          action={() => handleChangeLineSide(changeLineSide[1])}
          handleClose={() => setChangeLineSide([false, null, false])}
        />
      )}
      {isOpenAddDrawer && <AddGroup assetId={assetId} onAssetGroupCreated={handleAssetGroupCreated} open={isOpenAddDrawer} onClose={() => setOpenAddDrawer(false)} />}
      {/* Existing FedBy */}
      <PopupModal width='750px' open={isExistingFedByOpen[0]} onClose={handleCloseFedBy} title='Edit Connection' handleSubmit={handleExistingFedBy} cta='Save' disableCTA={isEmpty(topLevelAsset[0])} isFixed tblResponsive>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>Line-Side Asset</div>
          <MinimalAutoComplete value={topLevelAsset} placeholder='Select Line-Side Asset' w={45} isDisabled={isExistingFedByOpen[1]} />
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='text-bold'>Load-Side (OCP)</div>
          <MinimalAutoComplete options={filter(subComponentAssetOptions, item => item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE)} value={subLevelAsset} onChange={value => setSubLevelAsset(value)} placeholder='Select OCP' w={45} isClearable />
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
            {connectType === 2 && (
              <MinimalButtonGroup
                value={material}
                onChange={setMaterial}
                options={filter(materialNonFlexType, obj => obj.value >= 5).map(obj => ({
                  ...obj,
                  label: obj.label.toUpperCase(),
                }))}
                w={50}
              />
            )}
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
    </>
  )
}

export default EditAssetForm
