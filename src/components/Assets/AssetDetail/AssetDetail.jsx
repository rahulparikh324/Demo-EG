import React, { useEffect, useState, useRef, useCallback, useContext } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { AppBar } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { history } from 'helpers/history'
import getUserRole from 'helpers/getUserRole'
import $ from 'jquery'
import _ from 'lodash'
import assetDetail from 'Services/Asset/assetDetailService'
import enums from 'Constants/enums'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'
import SettingsIcon from '@material-ui/icons/Settings'
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt'
import PermScanWifiIcon from '@material-ui/icons/PermScanWifi'
import FlashAutoIcon from '@material-ui/icons/FlashAuto'
import getNamePlateInfoByAssetID from 'Services/Asset/getNamePlateInfoByAssetID.js'
import getActivityLogs from 'Services/Asset/getActivityLogs'
import noImageAvailable from 'Content/images/noImageAvailable.png'
import { Toast } from 'Snackbar/useToast'
import WarningOutlinedIcon from '@material-ui/icons/WarningOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
//import InspectionList from './InspectionListComponent'
import WorkOrderList from './workOrderListComponent'
//import FilterListIcon from '@material-ui/icons/FilterList'
import { Activity, ActivtyLoader } from './components'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../../Maintainance/components'
import CircularProgress from '@material-ui/core/CircularProgress'
import EditAssetForm from './edit-asset'
//import InsulationResistanceGraph from 'components/Assets/AssetDetail/ir-graph'
import SeverityIndex from 'components/Assets/AssetDetail/severity-index'
import { conditionOptions, criticalityOptions, maintenanceOptions, physicalConditionOptions } from 'components/WorkOrders/onboarding/utils'
import { StatusComponent, LabelVal, Menu, PopupModal } from 'components/common/others'
import { getDateTime, getFormatedDate, dateDifference } from 'helpers/getDateTime'
import { ActionButton, FloatingButton, MinimalButton } from 'components/common/buttons'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import SpeakerNotesOffOutlinedIcon from '@material-ui/icons/SpeakerNotesOffOutlined'
import NoSimOutlinedIcon from '@material-ui/icons/NoSimOutlined'
import Notes from './notes'
import QRCode from 'qrcode'
import { NavigatLinkToNewTab } from 'components/Requests/components'

import AssetIssueList from 'components/Assets/AssetDetail/issues'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import AssetPM from 'components/preventative-maintenance/asset'
import Attachments from 'components/Assets/AssetDetail/attachments'
// import SubComponents from './SubComponents'
import SubComponents from 'components/Assets/AssetDetail/component/sub-components'
import Circuits from 'components/Assets/AssetDetail/circuits'
import Inspections from 'components/Assets/AssetDetail/inspections'
import { useLocation } from 'react-router-dom/cjs/react-router-dom'
import Photos from 'components/Assets/AssetDetail/photos'
import ImagePreview from 'components/common/image-preview'
import { handleCompanyAccess } from 'Services/getCompanyAccess'
import { MainContext } from 'components/Main/provider'

const useStyles = makeStyles(theme => ({
  assetImage: { width: '100px', height: '100px', border: '1px solid #d1d1d1', borderRadius: '100px' },
  badge: { fontSize: '10px', fontWeight: 600, color: '#fff', background: '#f44336', padding: '3px 7px', borderRadius: '40px', marginLeft: '8px' },
}))

function AssetDetail({ assetId }) {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const [assetDetails, setAssetDetails] = useState({})
  const [assetStatus, setAssetStatus] = useState(3)
  const [meterHours, setMeterHours] = useState(0)
  const [selectedTab, setTab] = useState('OVERVIEW')
  const [dataFromList, setDataFromList] = useState({})
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const container = useRef(null)
  const [criticalIndex, setCriticalIndex] = useState(0)
  const [conditionIndex, setConditionIndex] = useState(0)
  const [isAssetImagesOpen, setIsAssetImagesOpen] = useState(false)
  const [render, setRender] = useState(0)
  //nameplate
  const [nameplateLoading, setNameplateLoading] = useState(true)
  const [info, setInfo] = useState({})
  const [editType, setEditType] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [showParents, setShowParents] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')
  const context = useContext(MainContext)

  //
  useEffect(() => {
    $('#pageLoading').show()
    setLoading(true)
    setNameplateLoading(true)
    ;(async () => {
      try {
        const assetDetailsData = await assetDetail({ asset_id: assetId })
        setAssetDetails(assetDetailsData.data.data)
        handleCompanyAccess({ companyId: _.get(assetDetailsData, 'data.data.client_company_id', null), siteId: _.get(assetDetailsData, 'data.data.site_id', null), siteName: _.get(assetDetailsData, 'data.data.site_name', ''), companyName: _.get(assetDetailsData, 'data.data.client_company_name', '') }, context, 'Asset')
        // console.log(assetDetailsData.data.data)
        if (assetDetailsData.data.data.status === 3) setAssetStatus(3)
        if (assetDetailsData.data.data.status === 4) setAssetStatus(4)
        setMeterHours(assetDetailsData.data.data.meter_hours)
        setCriticalIndex(assetDetailsData.data.data.criticality_index_type)
        setConditionIndex(assetDetailsData.data.data.condition_index_type)
        const res = await getNamePlateInfoByAssetID(assetId)
        const info = JSON.parse(res.data.form_retrived_nameplate_info)
        const namePlateInfo = _.omit(info, ['pleaseSelectTests', 'relaySettings'])
        setInfo(namePlateInfo)
        $('#pageLoading').hide()
        if (!_.isEmpty(history.location.state)) {
          if (history.location.state.fromPMList) {
            setDataFromList(history.location.state)
            setTab('PM_PLAN')
          }
        }
        setLoading(false)
        setNameplateLoading(false)
      } catch (err) {
        console.log(err)
        Toast.error(err)
        setLoading(false)
        setNameplateLoading(false)
        $('#pageLoading').hide()
      }
      setProfileUrl('')
    })()
  }, [loginData.uuid, assetId, render])

  const indexes = {
    criticalIndex: { value: criticalIndex, set: v => setCriticalIndex(v) },
    conditionIndex: { value: conditionIndex, set: v => setConditionIndex(v) },
  }

  const editAssetInfo = () => {
    setIsEditAssetOpen(true)
    setEditType('ASSET')
  }
  const editNameplateInfo = () => {
    setIsEditAssetOpen(true)
    setEditType('NAMEPLATE')
  }

  return (
    <div className='d-flex' style={{ height: 'calc(100vh - 64px)', background: '#fff' }} ref={container}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ width: '75%', borderRight: '1px solid #dee2e6', height: 'calc(100vh - 64px)' }}>
        <AssetInfo openParentList={() => setShowParents(true)} openQR={() => setShowQR(true)} onEdit={editAssetInfo} indexes={indexes} openImages={() => setIsAssetImagesOpen(true)} assetDetails={assetDetails} status={assetStatus} meterHours={meterHours} assetListfilterData={_.get(history, 'location.state.allState', {})} profileUrl={profileUrl} />
        <TablesContainer
          render={render}
          handleNamePlate={editNameplateInfo}
          nameplateLoading={nameplateLoading}
          nameplateInfo={info}
          assetDetails={assetDetails}
          loading={loading}
          dataFromList={dataFromList}
          issueCount={assetDetails.openIssuesCount}
          selected={selectedTab}
          selectTab={setTab}
          assetId={assetId}
          refetch={() => setRender(p => p + 1)}
          setProfileUrl={setProfileUrl}
        />
      </div>
      <div style={{ width: '25%' }}>
        <ActivityAndNotes assetId={assetId} />
      </div>
      {isEditAssetOpen && <EditAssetForm refetch={() => setRender(p => p + 1)} setAssetStatus={setAssetStatus} assetId={assetId} assetDetails={assetDetails} status={assetStatus} name={assetDetails.name} open={isEditAssetOpen} indexes={indexes} editType={editType} onClose={() => setIsEditAssetOpen(false)} />}
      {isAssetImagesOpen && <ImagePreview open={isAssetImagesOpen} onClose={() => setIsAssetImagesOpen(false)} images={_.get(assetDetails, 'asset_profile_images', [])} urlKey='asset_photo' />}
      {showQR && <AssetQR open={showQR} onClose={() => setShowQR(false)} assetDetails={assetDetails} />}
      {showParents && <ViewParents open={showParents} onClose={() => setShowParents(false)} assetDetails={assetDetails} />}
    </div>
  )
}

function AssetInfo({ assetDetails, onEdit, indexes, openImages, openQR, openParentList, assetListfilterData, profileUrl }) {
  const classes = useStyles()
  // const images = _.get(assetDetails, 'asset_profile_images', [])
  const profileImage = !_.isEmpty(profileUrl) ? profileUrl : !_.isEmpty(_.get(assetDetails, 'asset_profile_image', '')) ? _.get(assetDetails, 'asset_profile_image', '') : noImageAvailable
  const checkUserRole = new getUserRole()
  const menuOptions = [
    { id: 1, name: 'Edit', action: () => onEdit() },
    { id: 2, name: 'View Images', action: () => openImages(), disabled: d => _.isEmpty(_.get(assetDetails, 'asset_profile_images', [])) },
    { id: 3, name: 'View Asset QR', action: () => openQR(), disabled: d => _.isEmpty(_.get(assetDetails, 'qR_code', '')) },
  ]
  const Info = ({ label, value, style = {} }) => (
    <div style={style}>
      <div className='text-xs text-bold'>{label}</div>
      <div style={{ fontWeight: 500, wordWrap: 'break-word', color: '#5e5e5e' }}>{value}</div>
    </div>
  )
  const renderChip = (value, type, isFilled) => {
    if (!value) return
    const options = type === 'STATUS' ? enums.ASSET_STATUS_CHIPS : type === 'CONDITION' ? conditionOptions : type === 'PHYSICAL' ? physicalConditionOptions : type === 'MAINTENANCE' ? maintenanceOptions : criticalityOptions
    const { color, label } = options.find(d => d.value === value) || {}
    if (!color) return label
    return <StatusComponent color={color} label={label} size={type === 'STATUS' ? 'medium' : 'small'} filled={isFilled} hasDarkContrast={type === 'PHYSICAL'} />
  }
  const renderParent = parent => {
    if (_.isEmpty(parent)) return
    const parents = parent.slice(0, 2)
    const remainingCount = parent.length - 2
    return (
      <div>
        {parents.map((d, i) => (
          <div key={d.parent_asset_id} onClick={() => window.open(`../details/${d.parent_asset_id}`, '_blank')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
            <i>{d.parent_asset_name}</i>
            <span className='mr-2'>{i + 1 !== parents.length ? ',' : ''}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={openParentList}>
            + {remainingCount} MORE
          </div>
        )}
      </div>
    )
  }
  const renderTopLevel = asset => {
    if (_.isEmpty(asset)) return 'N/A'
    return (
      <div onClick={() => window.open(`../details/${asset.toplevelcomponent_asset_id}`, '_blank')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
        <i>{asset.toplevelcomponent_asset_name}</i>
      </div>
    )
  }
  //
  return (
    <div>
      <div className='p-3 d-flex align-items-center justify-content-between'>
        <div className='d-flex align-items-center'>
          <div className='mr-2'>
            <ActionButton action={() => history.push({ pathname: `/assets`, state: assetListfilterData })} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
          </div>
          <div className='text-bold text-md mr-2'>{assetDetails.name}</div>
          {assetDetails && renderChip(assetDetails.asset_operating_condition_state, 'PHYSICAL', true)}
        </div>
        <Menu options={menuOptions} data={assetDetails} />
      </div>
      <div className='p-3'>
        <div className='d-flex'>
          <img alt='Conduit' src={`${profileImage}${noImageAvailable !== profileImage ? `?value=${Math.random()}` : ''}`} className={classes.assetImage} />
          <div className='ml-3' style={{ display: 'grid', gridTemplateColumns: `repeat(5, 1fr)`, gridTemplateRows: '1fr 1fr', width: '100%' }}>
            <Info label='Internal ID' value={assetDetails.internal_asset_id} />
            {/* <Info label='Facility' value={assetDetails.site_name} /> */}
            <Info label='Condition of Maintenance' value={renderChip(assetDetails?.maintenance_index_type, 'MAINTENANCE', true)} />
            <Info label='Criticality' value={renderChip(indexes.criticalIndex.value)} />
            <Info label='Building' value={_.get(assetDetails.assetLocationHierarchy, 'formio_building_name', 'N/A')} className='col-3' />
            <Info label='Floor ' value={_.get(assetDetails.assetLocationHierarchy, 'formio_floor_name', 'N/A')} className='col-3' />
            {assetDetails.component_level_type_id === enums.COMPONENT_TYPE.SUB_COMPONENT ? (
              <Info label='Top Level Component ' value={renderTopLevel(_.get(assetDetails, 'asset_toplevel_componenent', ''))} className='col-3' />
            ) : (
              <Info label='Fed-By(s)' value={!_.isEmpty(assetDetails.asset_parent_mapping_list) ? renderParent(assetDetails.asset_parent_mapping_list) : 'N/A'} />
            )}
            <Info label='Asset Class' value={_.get(assetDetails, 'asset_class_name', 'N/A')} className='col-3' />
            <Info label='Operating Conditions' value={renderChip(indexes.conditionIndex.value, 'CONDITION')} />
            <Info label='Room' value={_.get(assetDetails.assetLocationHierarchy, 'formio_room_name', 'N/A ')} className='col-3' />
            <Info label='Section ' value={_.get(assetDetails.assetLocationHierarchy, 'formio_section_name', 'N/A')} className='col-3' />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityLog({ assetId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasNext, setHasNext] = useState(true)
  const [page, setPage] = useState(1)
  const observer = useRef()
  //
  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(p => p + 1)
      }
    })
    if (node) observer.current.observe(node)
  }, [])
  //
  useEffect(() => {
    ;(async () => {
      try {
        if (hasNext) {
          const _logs = await getActivityLogs(page, 0, assetId)
          const data = [...logs, ..._logs.data.list]
          setLogs(prev => [...prev, ..._logs.data.list])
          setHasNext(data.length < _logs.data.listsize)
          setLoading(false)
        }
        $('#pageLoading').hide()
      } catch (err) {
        console.log(err)
        Toast.error(err)
        setLoading(false)
        $('#pageLoading').hide()
      }
    })()
  }, [assetId, page])

  return (
    <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 115px)', height: 'calc(100vh - 115px)', padding: '12px' }}>
      {loading ? (
        <ActivtyLoader n={9} />
      ) : !_.isEmpty(logs) ? (
        logs.map((log, index) => <Activity activity={log} key={log.activity_id} elementRef={logs.length === index + 1 ? lastElementRef : null} />)
      ) : (
        <div style={{ height: 'calc(100%)', fontWeight: 800 }} className='d-flex flex-column justify-content-center align-items-center'>
          <NoSimOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />
          <div style={{ color: '#666', marginTop: '12px' }}>No Activities !</div>
        </div>
      )}
    </div>
  )
}

function TablesContainer({ selected, selectTab, assetId, issueCount, dataFromList, loading, assetDetails, nameplateLoading, nameplateInfo, handleNamePlate, render, refetch, setProfileUrl }) {
  const classes = useStyles()
  const [subRefetch, setSubRefetch] = useState(0)
  const [photoRefetch, setPhotoRefetch] = useState(0)

  const checkUserRole = new getUserRole()
  const Title = ({ title, count }) => (
    <div>
      {title}
      {count !== 0 && <span className={classes.badge}>{count}</span>}
    </div>
  )

  useEffect(() => {
    if (render > 0) {
      if (selected === 'SUB') setSubRefetch(render)
      if (selected === 'PHOTOS') setPhotoRefetch(render)
    }
  }, [render])

  return (
    <div className='asset-info-table-container' style={{ minWidth: '648px', height: 'calc(100vh - 310px)', padding: '0 16px 16px 16px' }}>
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={selected} onSelect={k => selectTab(k)}>
            <Tab eventKey='OVERVIEW' title='Overview' tabClassName='font-weight-bolder small-tab'></Tab>
            {(checkUserRole.isManager() || checkUserRole.isExecutive() || checkUserRole.isCompanyAdmin()) && <Tab eventKey='INSPECTION' title='Inspections' tabClassName='font-weight-bolder small-tab'></Tab>}
            {(checkUserRole.isManager() || checkUserRole.isCompanyAdmin()) && <Tab eventKey='PM' title='PMs' tabClassName='font-weight-bolder small-tab'></Tab>}
            <Tab eventKey='ISSUES' title={<Title title='Issues' count={issueCount} />} tabClassName='font-weight-bolder small-tab'></Tab>
            {(checkUserRole.isManager() || checkUserRole.isCompanyAdmin()) && assetDetails.component_level_type_id === enums.COMPONENT_TYPE.TOP_LEVEL && <Tab eventKey='SUB' title="Sub Components (OCP's)" tabClassName='font-weight-bolder small-tab'></Tab>}
            <Tab eventKey='PHOTOS' title='Photos' tabClassName='font-weight-bolder small-tab'></Tab>
            {(checkUserRole.isManager() || checkUserRole.isCompanyAdmin()) && assetDetails.component_level_type_id === enums.COMPONENT_TYPE.TOP_LEVEL && <Tab eventKey='CIR' title='Circuits' tabClassName='font-weight-bolder small-tab'></Tab>}
            {(checkUserRole.isManager() || checkUserRole.isCompanyAdmin()) && <Tab eventKey='ATTACHMENTS' title='Attachments' tabClassName='font-weight-bolder small-tab'></Tab>}
          </Tabs>
        </AppBar>
      </div>
      {selected === 'OVERVIEW' && <AssetOverview handleNamePlate={handleNamePlate} assetDetails={assetDetails} nameplateLoading={nameplateLoading} nameplateInfo={nameplateInfo} />}
      {selected === 'INSPECTION' && <Inspections assetId={assetId} />}
      {selected === 'ISSUES' && <AssetIssueList assetId={assetId} />}
      {selected === 'SUB' && <SubComponents assetId={assetId} subRefetch={subRefetch} />}
      {selected === 'CIR' && <Circuits assetId={assetId} render={render} assetDetails={assetDetails} />}
      {selected === 'ISSUE_SEVERITY_INDEX' && <SeverityIndex />}
      {selected === 'PM' && <AssetPM assetDetails={assetDetails} />}
      {selected === 'ATTACHMENTS' && <Attachments assetId={assetId} />}
      {selected === 'PHOTOS' && <Photos assetId={assetId} refetch={refetch} setProfileUrl={setProfileUrl} photoRefetch={photoRefetch} />}
    </div>
  )
}

const ActivityAndNotes = ({ assetId }) => {
  const [selectedTab, setTab] = useState('ACTIVITY')
  return (
    <div>
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={selectedTab} onSelect={k => setTab(k)}>
            <Tab eventKey='ACTIVITY' title='Activity Log' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='NOTES' title='Notes' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div>
      {selectedTab === 'ACTIVITY' && <ActivityLog assetId={assetId} />}
      {selectedTab === 'NOTES' && <Notes assetId={assetId} />}
    </div>
  )
}

const ViewAssetImage = ({ open, onClose, assetDetails }) => {
  const [index, setIndex] = useState(0)
  const images = _.get(assetDetails, 'asset_profile_images', [])

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ position: 'relative' }}>
      <FormTitle title='Asset Images' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div style={{ width: '95vw', height: 'inherit' }} className='d-flex'>
        <div onClick={() => index !== 0 && setIndex(prev => prev - 1)} style={{ height: '100%', width: '4%', cursor: index !== 0 ? 'pointer' : 'not-allowed' }} className='d-flex justify-content-center align-items-center'>
          <ChevronLeftIcon style={{ color: index !== 0 ? '#121212' : '#b9b4b4' }} />
        </div>
        <div id='asset-image-container' style={{ width: '92%', height: 'calc(100%-64px)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', background: `url(${images[index].asset_photo})` }} />
        <div onClick={() => index !== images.length - 1 && setIndex(prev => prev + 1)} style={{ height: '100%', width: '4%', cursor: index !== images.length - 1 ? 'pointer' : 'not-allowed' }} className='d-flex justify-content-center align-items-center'>
          <ChevronRightIcon style={{ color: index !== images.length - 1 ? '#121212' : '#b9b4b4' }} />
        </div>
      </div>
    </Drawer>
  )
}

const AssetOverview = ({ assetDetails, nameplateLoading, nameplateInfo, handleNamePlate }) => {
  const checkUserRole = new getUserRole()
  const ContentChip = ({ title, dueIn, date, icon }) => (
    <div className={`mb-2 mr-2`} style={{ borderRadius: '8px', height: '100%', border: '1px solid #eee', minWidth: '225px', width: '225px' }}>
      <div className='d-flex py-2 px-3' style={{ borderBottom: '1px solid #eee' }}>
        {icon}
        <strong style={{ fontSize: '14px', marginLeft: '8px' }}>{title}</strong>
      </div>
      <div className='py-2 px-3'>
        <div className='d-flex align-items-center mb-2'>
          <div style={{ fontSize: '12px' }}>Last Performed :</div>
          <strong style={{ fontSize: '15px', marginLeft: '8px' }}>{getFormatedDate(date)}</strong>
        </div>
        <div className='d-flex align-items-center'>
          <div style={{ fontSize: '12px' }}>Due In :</div>
          <strong style={{ fontSize: '15px', marginLeft: '8px' }}>{dueIn ? dueIn : 'NA'}</strong>
        </div>
      </div>
    </div>
  )
  const getKey = key => {
    const camelCaseKey = key.split('_').slice(-1)[0]
    return _.startCase(camelCaseKey)
  }
  return (
    <div>
      {/* <div className='d-flex pt-2' style={{ height: '120px', width: '100%', overflow: 'auto hidden', whiteSpace: 'nowrap' }} id='style-1'>
        <ContentChip icon={<AssignmentTurnedInIcon style={{ fontSize: '22px', color: '#778899' }} />} title='Visual Inspection' date={assetDetails.visual_insepction_last_performed} dueIn={dateDifference(_.get(assetDetails, 'visual_insepction_due_in', null))} />
        <ContentChip icon={<SettingsIcon style={{ fontSize: '22px', color: '#778899' }} />} title='Mechanical Inspection' date={assetDetails.mechanical_insepction_last_performed} dueIn={dateDifference(_.get(assetDetails, 'mechanical_insepction_due_in', null))} />
        <ContentChip icon={<OfflineBoltIcon style={{ fontSize: '22px', color: '#778899' }} />} title='Electrical Tests' date={assetDetails.electrical_insepction_last_performed} dueIn={dateDifference(_.get(assetDetails, 'electrical_insepction_due_in', null))} />
        <ContentChip icon={<PermScanWifiIcon style={{ fontSize: '22px', color: '#778899' }} />} title='Infrared Scan' date={assetDetails.infrared_insepction_last_performed} dueIn={dateDifference(_.get(assetDetails, 'infrared_insepction_due_in', null))} />
        <ContentChip icon={<FlashAutoIcon style={{ fontSize: '22px', color: '#778899' }} />} title='Arc Flash Study' date={assetDetails.arc_flash_study_last_performed} dueIn={dateDifference(_.get(assetDetails, 'arc_flash_study_insepction_due_in', null))} />
      </div> */}
      <div className='d-flex align-items-center justify-content-between' style={{ padding: '10px 0' }}>
        <div className='text-bold text-sm mr-2'>Nameplate Information</div>
        {/* {!_.isEmpty(nameplateInfo) && !checkUserRole.isCompanyAdmin() && <ActionButton action={handleNamePlate} icon={<EditOutlinedIcon fontSize='small' />} tooltip='EDIT' />} */}
      </div>
      <div style={{ padding: '16px', position: 'relative', minHeight: '400px' }}>
        {nameplateLoading ? (
          <CircularProgress size={24} thickness={5} style={{ position: 'absolute', top: '50%', left: '50%' }} />
        ) : _.isEmpty(nameplateInfo) ? (
          <div className='d-flex flex-column align-items-center' style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', left: '50%', fontWeight: 800 }}>
            <SpeakerNotesOffOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />
            <div style={{ color: '#666', marginTop: '12px' }}>Nameplate information does not exist !</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, 1fr)` }}>
            {Object.keys(nameplateInfo).map(key => (
              <div className={`${!_.isEmpty(nameplateInfo[key]) && nameplateInfo[key].length > 20 ? '' : 'd-flex'} my-2`} key={key}>
                <div style={{ fontWeight: 800, fontSize: '13px' }}>{getKey(key)} : </div>
                <div style={{ wordWrap: 'break-word', fontSize: '13px', color: '#5e5e5e' }}>{!_.isEmpty(nameplateInfo[key]) && `${nameplateInfo[key]}`}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const AssetQR = ({ open, onClose, assetDetails }) => {
  const [qr, setQR] = useState('')
  if (_.get(assetDetails, 'qR_code', null)) {
    QRCode.toDataURL(_.get(assetDetails, 'qR_code', null))
      .then(url => setQR(url))
      .catch(err => console.error(err))
  }
  //
  const copyQR = () => {
    navigator.clipboard.writeText(_.get(assetDetails, 'qR_code', ''))
    Toast.success('QR code copied !')
  }
  const downloadQR = () => {
    const img = document.querySelector('#qr-code')
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, 200, 200)
    const dataUrl = canvas.toDataURL('image/png')

    const link = document.createElement('a')
    link.download = `${_.get(assetDetails, 'name', '')}-QR-CODE.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <PopupModal open={open} onClose={onClose} noHeader noActions width={28}>
      <div className='d-flex flex-column align-items-center'>
        <div style={{ fontSize: '20px' }} className='text-bold mt-3 '>
          Scan QR code
        </div>
        <div style={{ fontSize: '14px', color: '#5e5e5e', fontWeight: 800 }}>Scan this code to get the Asset</div>
        <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', margin: '20px 0' }}>
          <img id='qr-code' alt='qr-code' src={qr} style={{ width: '200px', height: '200px' }} />
        </div>
        <div className='mb-2' style={{ fontWeight: 800, fontSize: '12px', color: '#5e5e5e', width: '95%' }}>
          <div className='decorated text-bold'>
            <span>or copy the code manually</span>
          </div>
        </div>
        <div className='d-flex justify-space-between align-items-center mb-3'>
          <div className='minimal-input-base'>{_.get(assetDetails, 'qR_code', null)}</div>
          <FloatingButton onClick={copyQR} icon={<FileCopyOutlinedIcon fontSize='small' />} style={{ width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
        </div>
        <hr style={{ width: '100%', borderTop: '1px solid #a4a4a4', margin: '0 8px' }} />
        <MinimalButton startIcon={<GetAppOutlinedIcon />} text='Download QR code' onClick={downloadQR} variant='contained' color='primary' baseClassName='mt-3 mb-2' />
      </div>
    </PopupModal>
  )
}

const ViewParents = ({ open, onClose, assetDetails }) => {
  return (
    <PopupModal open={open} onClose={onClose} noActions title='Fed-By(s)' width={25}>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '250px', height: '250px' }}>
        {_.get(assetDetails, 'asset_parent_mapping_list', []).map(d => (
          <div key={d.parent_asset_id}>
            <NavigatLinkToNewTab title={d.parent_asset_name} func={() => window.open(`../details/${d.parent_asset_id}`, '_blank')} />
          </div>
        ))}
      </div>
    </PopupModal>
  )
}

export default AssetDetail
