import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle, DeleteDailog } from '../../Maintainance/components'
import { PlanList, PlanItem } from './components'
import { makeStyles } from '@material-ui/core/styles'
// import AddEditPM from './AddEditPM'
import ViewPlan from './ViewPlan'
import MarkComplete from './MarkComplete'
import '../../Maintainance/maintainance.css'
import $ from 'jquery'
import _ from 'lodash'
import getPMCategories from '../../../Services/Maintainance/getPMCategories.service'
import addPlanToAsset from '../../../Services/Asset/addPlanToAsset.service'
import removePlanFromAsset from '../../../Services/Asset/removePlanFromAsset.service'
import getPlanForAsset from '../../../Services/Asset/getPlanForAsset.service'
import deleteAssetPM from '../../../Services/Asset/deleteAssetPM'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Toast } from '../../../Snackbar/useToast'
import { history } from '../../../helpers/history'
import DialogPrompt from '../../DialogPrompt'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import FilterListIcon from '@material-ui/icons/FilterList'

const useStyles = makeStyles(theme => ({
  planContainer: {
    //height: '100%',
    padding: '16px',
    '&::-webkit-scrollbar': { width: '0.4em' },
    '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' },
    position: 'relative',
  },
  listContainer: {
    height: '93vh',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': { width: '0.4em' },
    '&::-webkit-scrollbar-thumb': { background: '#e0e0e0' },
    background: '#efefef',
  },
  loadingRoot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
}))

function PMPlan({ assetId, dataFromList }) {
  const classes = useStyles()
  const [openAddPlan, setOpenAddPlan] = useState(false)
  const [openEditPlan, setOpenEditPlan] = useState(false)
  const [openViewPlan, setOpenViewPlan] = useState(false)
  const [openMarkCompletePlan, setOpenMarkCompletePlan] = useState(false)
  const [categories, setCategories] = useState([])
  const [planItems, setPlanItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [editObj, setEditObj] = useState({})
  const [viewObj, setViewObj] = useState({})
  const [isDeletePMOpen, setDeletePM] = useState(false)
  const [deleteObj, setDeleteObj] = useState({})
  const [isRemovePlanOpen, setRemovePlan] = useState(false)
  const [isDuplicateOpen, setDuplicate] = useState(false)
  const [isDuplicatePMOpen, setDuplicatePM] = useState(false)
  const [pmToDuplicate, setPMToDuplicate] = useState({})
  const [reRender, setRender] = useState(0)
  const [markCompleteObj, setMarkCompleteObj] = useState({})
  const [isFromList, setIsFromList] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [filterType, setFilterType] = useState(0)
  //on edit
  const onEdit = item => {
    setEditObj(item)
    setOpenEditPlan(true)
  }
  const onView = item => {
    setOpenViewPlan(true)
    setViewObj(item)
  }
  const onDelete = item => {
    setDeleteObj(item)
    setDeletePM(true)
  }
  const onDuplicate = item => {
    setPMToDuplicate(item)
    setDuplicate(true)
  }
  const duplicatePMItem = () => {
    setDuplicate(false)
    setDuplicatePM(true)
    //console.log('duplicate', pmToDuplicate)
  }
  const deletePM = async () => {
    setDeletePM(false)
    $('#pageLoading').show()
    try {
      const res = await deleteAssetPM(deleteObj.asset_pm_id)
      if (res.success > 0) {
        Toast.success('PM deleted successfully')
        setRender(prev => prev + 1)
      } else Toast.error(res.message)
    } catch (error) {
      //console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
    if (isFromList) history.push({ pathname: `../../preventative-maintenance-list` })
  }
  const closeDelFunction = () => {
    setDeletePM(false)
    if (isFromList) history.push({ pathname: `../../preventative-maintenance-list` })
  }
  const removePlan = async () => {
    setRemovePlan(false)
    $('#pageLoading').show()
    try {
      const id = planItems[0].asset_pm_plan_id
      const res = await removePlanFromAsset(id)
      //console.log(res)
      if (res.success > 0) {
        Toast.success('Plan removed successfully')
        setRender(prev => prev + 1)
      } else Toast.error(res.message)
    } catch (error) {
      //console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }
  //plan [on-click]
  const addPlan = async item => {
    setOpenAddPlan(false)
    $('#pageLoading').show()
    try {
      const reqBody = { asset_id: assetId, pm_plan_id: item.pm_plan_id }
      const res = await addPlanToAsset(reqBody)
      //console.log(res)
      if (res.success > 0) {
        Toast.success('Plan Added successfully')
        setRender(prev => prev + 1)
      } else Toast.error(res.message)
    } catch (error) {
      //console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }
  const afterSubmit = () => setRender(prev => prev + 1)
  const onMarkComplete = item => {
    setMarkCompleteObj(item)
    setOpenMarkCompletePlan(true)
  }
  const onLastStatusUpdate = () => {
    setOpenEditPlan(false)
    onMarkComplete(editObj)
  }
  //
  useEffect(() => {
    setLoading(true)
    setAnchorEl(null)
    ;(async () => {
      try {
        const categories = await getPMCategories()
        const plan = await getPlanForAsset(assetId, filterType)
        setCategories(categories.list)
        setPlanItems(plan.list)
        //console.log(plan.list)
        if (!_.isEmpty(dataFromList.value)) {
          const obj = plan.list.find(d => d.asset_pm_id === dataFromList.value.asset_pm_id)
          if (!_.isEmpty(obj)) {
            setIsFromList(true)
            const { action } = dataFromList
            if (action === 'VIEW') onView(obj)
            if (action === 'EDIT') onEdit(obj)
            if (action === 'DUPLICATE') onDuplicate(obj)
            if (action === 'COMPLETE') onMarkComplete(obj)
            if (action === 'DELETE') onDelete(obj)
          }
        }
      } catch (error) {
        setCategories([])
      }
      setLoading(false)
    })()
  }, [reRender, filterType])

  //
  return (
    <div className={` asset-detail-pm-plans`} style={{ height: 'calc(100vh - 180px)' }}>
      <div className={`${classes.planContainer} table-responsive dashboardtblScroll`} id='style-1' style={{ height: 'calc(100% - 70px)', overflowX: 'hidden' }}>
        <Button onClick={e => setAnchorEl(e.currentTarget)} size='small' startIcon={<FilterListIcon />} variant='contained' color='primary' className='nf-buttons mb-2' disableElevation>
          {filterType === 0 ? 'All' : filterType === 1 ? 'Upcoming PMs' : 'Completed PMs'}
        </Button>
        <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setFilterType(0)} disabled={filterType === 0}>
            All
          </MenuItem>
          <MenuItem onClick={() => setFilterType(1)} disabled={filterType === 1}>
            Upcoming PMs
          </MenuItem>
          <MenuItem onClick={() => setFilterType(2)} disabled={filterType === 2}>
            Completed PMs
          </MenuItem>
        </Menu>
        {loading ? (
          <CircularProgress classes={{ root: classes.loadingRoot }} size={30} thickness={5} />
        ) : _.isEmpty(planItems) ? (
          <div className='d-flex justify-content-center align-items-center' style={{ height: '92%', fontWeight: 800 }}>
            {planItems.length === 0 && filterType !== 0 ? 'No plans for this filter' : 'No PM plans, Click Add plan to assign one'}
          </div>
        ) : (
          planItems.map(planItem => (
            <PlanItem
              //
              key={planItem.asset_pm_id}
              item={planItem}
              onEdit={() => onEdit(planItem)}
              onView={() => onView(planItem)}
              onDelete={() => onDelete(planItem)}
              onDuplicate={() => onDuplicate(planItem)}
              onMarkComplete={() => onMarkComplete(planItem)}
            />
          ))
        )}
      </div>
      <div className='d-flex justify-content-between p-3 align-items-center border-top'>
        <span>{planItems.length === 0 ? `No PM Plan` : planItems[0].asset_pm_plan_name}</span>
        {planItems.length === 0 && filterType === 0 ? (
          <Button variant='contained' onClick={() => setOpenAddPlan(true)} color='primary' className='primary-button-x' disableElevation startIcon={<AddIcon />}>
            Add Plan
          </Button>
        ) : (
          <Button variant='contained' color='default' className='primary-button-x' disableElevation onClick={() => setRemovePlan(true)}>
            Remove Plan
          </Button>
        )}
      </div>
      <Drawer anchor='right' open={openAddPlan} onClose={() => setOpenAddPlan(false)}>
        <FormTitle title='Add PM Schedule' closeFunc={() => setOpenAddPlan(false)} />
        <div className={classes.listContainer}>{categories.length !== 0 && categories.map(item => item.pmPlansCount !== 0 && <PlanList addPlan={addPlan} key={item.pm_category_id} item={item} title={item.category_name} count={item.pmPlansCount} />)}</div>
      </Drawer>
      {/* {openEditPlan && <AddEditPM isFromList={isFromList} onLastStatusUpdate={onLastStatusUpdate} afterSubmit={afterSubmit} setToastMsg={Toast} onEditObject={editObj} open={openEditPlan} onClose={() => setOpenEditPlan(false)} />}
      {isDuplicatePMOpen && <AddEditPM isFromList={isFromList} onDuplicateObject={pmToDuplicate} afterSubmit={afterSubmit} setToastMsg={Toast} open={isDuplicatePMOpen} onClose={() => setDuplicatePM(false)} />} */}
      <ViewPlan isFromList={isFromList} open={openViewPlan} onClose={() => setOpenViewPlan(false)} viewObj={viewObj} />
      {openMarkCompletePlan && <MarkComplete isFromList={isFromList} afterSubmit={afterSubmit} setToastMsg={Toast} obj={markCompleteObj} open={openMarkCompletePlan} handleClose={() => setOpenMarkCompletePlan(false)} />}
      <DialogPrompt title='Delete PM' ctaText='Delete' text='Are you sure you want to delete this PM ?' open={isDeletePMOpen} action={deletePM} handleClose={closeDelFunction} />
      <DialogPrompt title='Remove Plan' ctaText='Remove' text='Are you sure you want to remove the plan ?' open={isRemovePlanOpen} action={removePlan} handleClose={() => setRemovePlan(false)} />
      <DialogPrompt title='Duplicate PM' ctaText='Duplicate' text='Are you sure you want to duplicate this PM item ?' open={isDuplicateOpen} action={duplicatePMItem} handleClose={() => setDuplicate(false)} />
    </div>
  )
}

export default PMPlan
