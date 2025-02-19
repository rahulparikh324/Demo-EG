import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { Pane, FormTitle, BottomBar, CategoryList, CategoryItem, PlanItem, EmptyState, DeleteDailog } from './components'
import TextField from '@material-ui/core/TextField'
import Accordion from './Accordian'
import AddEditPM from './AddEditPM'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import './maintainance.css'
import $ from 'jquery'
import _ from 'lodash'
import getPMCategories from '../../Services/Maintainance/getPMCategories.service'
import addPMCategory from '../../Services/Maintainance/addPMCategory.service'
import getPMPlansByCategory from '../../Services/Maintainance/getPMPlansByCategory.service'
import addUpdatePMPlan from '../../Services/Maintainance/addUpdatePMPlan.service'
import deleteCategory from '../../Services/Maintainance/deleteCategory.service'
import deletePMPlan from '../../Services/Maintainance/deletePMPlan.service'
import duplicatePlan from '../../Services/Maintainance/duplicatePlan.service'
import getPMsByPlan from '../../Services/Maintainance/getPMsByPlan.service'
import { Toast } from '../../Snackbar/useToast'
import DialogPrompt from '../DialogPrompt'
import { MinimalInput } from '../Assets/components'

const useStyles = makeStyles(theme => ({
  root: { padding: 0, flexGrow: 1, height: 'calc(100vh - 68px)' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  input: { margin: '16px 16px 0 16px', width: '92%' },
  radio: { margin: '16px 16px 0 16px', fontSize: '14px' },
  radioLabel: { fontSize: '14px', margin: 0 },
  containerDiv: { display: 'flex', justifyContent: 'space-between', flexDirection: 'column', height: '100%', background: '#efefef' },
  containerSubDiv: { display: 'flex', flexDirection: 'column' },
  subTitile: { padding: '12px 16px', background: '#eee', fontSize: '16px', fontWeight: 500, border: '1px solid #d1d1d1', borderLeft: 0, borderRight: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  button: { padding: '4px 16px', borderRadius: '40px', margin: 0, textTransform: 'capitalize' },
}))
const styles = {
  paneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #A6A6A6', padding: '12px' },
  bottomBar: { borderTop: '1px solid #A6A6A6', borderBottom: 'none', background: '#fff', marginTop: 'auto' },
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
}

function PMSettings() {
  const classes = useStyles()
  const [isCategoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
  const [isCategoryRenamed, setCategoryRename] = useState(false)
  const [categoryRenameObj, setCategoryRenameObj] = useState({})
  const [categories, setCategories] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [categoryNameError, setCategoryNameError] = useState(null)
  const [activeCategory, setActiveCategory] = useState({})
  const [isDeleteCategoryOpen, setDeleteCategory] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState({})
  //
  const [isPlanDrawerOpen, setPlanDrawerOpen] = useState(false)
  const [isPlanMoveDrawerOpen, setPlanMoveDrawerOpen] = useState(false)
  const [moveToCategory, setMoveToCategory] = useState('')
  const [planName, setPlanName] = useState('')
  const [planNameError, setPlanNameError] = useState(null)
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState({})
  const [isPlanRenamed, setPlanRenamed] = useState(false)
  const [isPlanMoved, setPlanMoved] = useState(false)
  const [planRenameObj, setPlanRenameObj] = useState({})
  const [planMoveObj, setPlanMoveObj] = useState({})
  const [isDeletePlanOpen, setDeletePlan] = useState(false)
  const [planToDelete, setPlanToDelete] = useState({})
  const [isDuplicatePlanOpen, setDuplicatePlan] = useState(false)
  const [planToDuplicate, setPlanToDuplicate] = useState({})
  //
  const [isScheduleListDrawerOpen, setScheduleListDrawerOpen] = useState(false)
  const [pmList, setPMList] = useState([])
  //
  const [reRender, setRender] = useState(0)
  // CATEGORY RELATED ACTIONS
  // Click [click-cat]
  const handleItemClick = (itemId, reset) => {
    const clickedItem = categories.find(e => e.pm_category_id === itemId)
    setActiveCategory(clickedItem)
    setActivePlan({})
    if (!reset) getPlans(itemId)
  }
  // Get Plans on [click-cat]
  const getPlans = async id => {
    $('#pageLoading').show()
    try {
      const res = await getPMPlansByCategory(id)
      setPlans(res.list)
    } catch (error) {}
    $('#pageLoading').hide()
  }
  // Rename [rename-cat]
  const reName = item => {
    const { category_name, pm_category_id } = item
    setCategoryDrawerOpen(true)
    setCategoryName(category_name)
    setCategoryRename(true)
    setCategoryRenameObj({ category_name, pm_category_id })
  }
  // Add [add-cat]
  const addCategory = async () => {
    if (categoryName.trim().length === 0) setCategoryNameError({ error: true, msg: 'Category Name cannot be empty' })
    else if (categoryName.trim().length > 49) setCategoryNameError({ error: true, msg: 'Category Name cannot contain more than 49 characters' })
    else if (/[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/.test(categoryName)) setCategoryNameError({ error: true, msg: '* No special characters except ‘-’' })
    else {
      setCategoryNameError(null)
      $('#pageLoading').show()
      setCategoryDrawerOpen(false)
      try {
        const reqData = isCategoryRenamed ? { ...categoryRenameObj, category_name: categoryName } : { category_name: categoryName }
        const msg = isCategoryRenamed ? 'Category renamed successfully !' : 'New category added successfully !'
        const res = await addPMCategory(reqData)
        if (res.success > 0) Toast.success(msg)
        else Toast.error(res.message)
      } catch (error) {
        Toast.error('Something went wrong !')
      }
      setRender(prev => prev + 1)
      setCategoryRename(false)
      setCategoryName('')
      $('#pageLoading').hide()
    }
  }
  // Delete Confirm [del-cat]
  const handleOnDelete = item => {
    setCategoryToDelete(item)
    setDeleteCategory(true)
  }
  // Delete [del-cat]
  const deleteCategoryItem = async () => {
    setDeleteCategory(false)
    $('#pageLoading').show()
    try {
      const res = await deleteCategory(categoryToDelete.pm_category_id)
      if (res.success > 0) {
        Toast.success('Category Deleted successfully')
        if (categoryToDelete.pm_category_id === activeCategory.pm_category_id) {
          setCategories([])
          setActiveCategory({})
        }
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setRender(prev => prev + 1)
    $('#pageLoading').hide()
  }
  // PLAN RELATED ACTIONS
  // Click [click-plan]
  const handlePlanClick = (itemId, reset) => {
    const clickedItem = plans.find(e => e.pm_plan_id === itemId)
    setActivePlan(clickedItem)
    if (!reset) getPMs(itemId)
  }
  // Get PMs on [click-plan]
  const getPMs = async id => {
    $('#pageLoading').show()
    try {
      const res = await getPMsByPlan(id)
      //console.log(res.list)
      setPMList(res.list)
    } catch (error) {}
    $('#pageLoading').hide()
  }
  // Rename [rename-plan]
  const renamePlan = item => {
    const { pm_category_id, pm_plan_id, plan_name } = item
    setPlanRenameObj({ pm_category_id, pm_plan_id, plan_name })
    setPlanName(plan_name)
    setPlanDrawerOpen(true)
    setPlanRenamed(true)
  }
  // Add [add-plan]
  const addPlan = async () => {
    if (planName.trim().length === 0 && !isPlanMoved) setPlanNameError({ error: true, msg: 'Plan Name cannot be empty' })
    else if (planName.trim().length > 49) setPlanNameError({ error: true, msg: 'Plan Name cannot contain more than 49 characters' })
    else if (/[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/.test(planName) && !isPlanMoved) setPlanNameError({ error: true, msg: '* No special characters except ‘-’' })
    else {
      setPlanNameError(null)
      $('#pageLoading').show()
      setPlanDrawerOpen(false)
      setPlanMoveDrawerOpen(false)
      try {
        const reqData = isPlanRenamed ? { ...planRenameObj, plan_name: planName } : isPlanMoved ? { ...planMoveObj, pm_category_id: moveToCategory } : { plan_name: planName, pm_category_id: activeCategory.pm_category_id }
        const msg = isPlanRenamed ? 'Plan renamed successfully !' : isPlanMoved ? 'Plan moved to other category !' : 'New plan added successfully !'
        const res = await addUpdatePMPlan(reqData)
        if (res.success > 0) Toast.success(msg)
        else Toast.error(res.message)
        getPlans(activeCategory.pm_category_id)
        setRender(prev => prev + 1)
      } catch (error) {
        Toast.error('Something went wrong !')
      }
      $('#pageLoading').hide()
      setPlanRenamed(false)
      setPlanMoved(false)
    }
  }
  // Delete Confirm [del-plan]
  const handleOnDeletePlan = item => {
    setPlanToDelete(item)
    setDeletePlan(true)
  }
  // Duplicate Confirm [dup-plan]
  const handleOnDuplicatePlan = item => {
    setPlanToDuplicate(item)
    setDuplicatePlan(true)
  }
  // Delete [del-plan]
  const deletePlanItem = async () => {
    setDeletePlan(false)
    $('#pageLoading').show()
    // console.log(activePlan, planToDelete)
    try {
      const res = await deletePMPlan(planToDelete.pm_plan_id)
      // console.log(res)
      if (res.success > 0) {
        Toast.success('Plan Deleted successfully')
        if (planToDelete.pm_plan_id === activePlan.pm_plan_id) {
          setPMList([])
          setActivePlan({})
        }
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setRender(prev => prev + 1)
    getPlans(activeCategory.pm_category_id)
    $('#pageLoading').hide()
  }
  // Duplicate [dup-plan]
  const duplicatePlanItem = async () => {
    setDuplicatePlan(false)
    $('#pageLoading').show()
    try {
      const res = await duplicatePlan(planToDuplicate.pm_plan_id)
      if (res.success > 0) Toast.success('Plan Duplicated successfully')
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    setRender(prev => prev + 1)
    getPlans(activeCategory.pm_category_id)
    $('#pageLoading').hide()
  }
  // Move [move-plan]
  const movePlan = ({ pm_category_id, pm_plan_id, plan_name }) => {
    setPlanMoveDrawerOpen(true)
    setMoveToCategory(pm_category_id)
    setPlanMoved(true)
    setPlanMoveObj({ pm_plan_id, plan_name, pm_category_id })
  }
  // PM RELATED ACTIONS
  // Add PM [add-pm]
  const afterSubmitPM = async () => {
    getPlans(activeCategory.pm_category_id)
    getPMs(activePlan.pm_plan_id)
  }
  // CLOSING PANE ACTIONS
  const closeCategoryPane = () => {
    setCategoryDrawerOpen(false)
    setCategoryRename(false)
    setCategoryName('')
    setCategoryNameError(null)
  }
  const closePlanPane = () => {
    setPlanDrawerOpen(false)
    setPlanRenamed(false)
    setPlanName('')
    setPlanNameError(null)
  }
  const closePlanMovePane = () => {
    setPlanMoveDrawerOpen(false)
    setPlanMoved(false)
    setMoveToCategory('')
  }
  //
  useEffect(() => {
    $('#pageLoading').show()
    ;(async () => {
      try {
        const categories = await getPMCategories()
        const items = categories.list.map(elm => ({ ...elm, active: false }))
        setCategories(items)
      } catch (error) {
        setCategories([])
      }
      $('#pageLoading').hide()
    })()
  }, [reRender])
  //
  return (
    <div className='row mx-0' style={{ height: '92vh', background: '#fff' }}>
      <CategoryList title='Category' openFunc={() => setCategoryDrawerOpen(true)} xs={2}>
        {categories.map(item => (
          <CategoryItem key={item.pm_category_id} active={item.pm_category_id === activeCategory.pm_category_id} reNameFunc={() => reName(item)} onDelete={() => handleOnDelete(item)} itemClick={() => handleItemClick(item.pm_category_id)} item={item} title={item.category_name} count={item.pmPlansCount} />
        ))}
      </CategoryList>
      <CategoryList title='Plans' openFunc={() => setPlanDrawerOpen(true)} xs={2} disabled={_.isEmpty(activeCategory)}>
        {_.isEmpty(activeCategory) ? (
          <EmptyState text='No category selected' />
        ) : _.isEmpty(plans) ? (
          <EmptyState text='No plans in this category, click new to add plan' />
        ) : (
          plans.map(item => (
            <PlanItem
              key={item.pm_plan_id}
              active={activePlan.pm_plan_id === item.pm_plan_id}
              reNameFunc={() => renamePlan(item)}
              onDelete={() => handleOnDeletePlan(item)}
              onDuplicate={() => handleOnDuplicatePlan(item)}
              onMove={() => movePlan(item)}
              itemClick={() => handlePlanClick(item.pm_plan_id)}
              item={item}
              title={item.plan_name}
              count={item.pmCount}
            />
          ))
        )}
      </CategoryList>
      <Pane title='PM' openFunc={() => setScheduleListDrawerOpen(true)} xs={6} disabled={_.isEmpty(activePlan)}>
        <div className='accordion-container'>{_.isEmpty(activePlan) ? <EmptyState text='No plan selected' /> : _.isEmpty(pmList) ? <EmptyState text='No PMs in this Plan, click new to add plan' /> : pmList.map(item => <Accordion plans={plans} afterSubmit={afterSubmitPM} plan={activePlan} key={item.pm_id} item={item} />)}</div>
      </Pane>
      <Drawer anchor='right' open={isCategoryDrawerOpen} onClose={() => closeCategoryPane()}>
        <FormTitle title={!isCategoryRenamed ? 'Add New Category' : 'Rename Category'} closeFunc={() => closeCategoryPane()} />
        <div className={classes.containerDiv}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', margin: '10px' }}>
            <MinimalInput value={categoryName} onChange={setCategoryName} error={categoryNameError} label='Category Name' placeholder='Enter category name' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} onFocus={() => setCategoryNameError(null)} />
          </div>
          <BottomBar buttonText={!isCategoryRenamed ? 'Add Category' : 'Rename'} onClose={() => closeCategoryPane()} submitFunc={addCategory} showIcon={!isCategoryRenamed} />
        </div>
      </Drawer>
      <Drawer anchor='right' open={isPlanDrawerOpen} onClose={() => closePlanPane()}>
        <FormTitle title={isPlanRenamed ? 'Rename Plan' : 'Add New Plan'} closeFunc={() => closePlanPane()} />
        <div className={classes.containerDiv}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', margin: '10px' }}>
            <MinimalInput value={planName} onChange={setPlanName} error={planNameError} label='Plan Name' placeholder='Enter plan name' w={100} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} onFocus={() => setPlanNameError(null)} />
          </div>
          <BottomBar buttonText={isPlanRenamed ? 'Rename' : 'Add Plan'} onClose={() => closePlanPane()} submitFunc={addPlan} showIcon={!isPlanRenamed} />
        </div>
      </Drawer>
      <Drawer anchor='right' open={isPlanMoveDrawerOpen} onClose={() => closePlanMovePane()}>
        <FormTitle title='Move plan' closeFunc={() => closePlanMovePane()} />
        <div className={classes.containerDiv}>
          <FormControl variant='outlined' className={classes.input}>
            <InputLabel htmlFor='outlined-age-native-simple'>Select Category</InputLabel>
            <Select native value={moveToCategory} onChange={e => setMoveToCategory(e.target.value)} label='Schedule type'>
              {categories.map(item => (
                <option key={item.pm_category_id} value={item.pm_category_id}>
                  {item.category_name}
                </option>
              ))}
            </Select>
          </FormControl>
          <BottomBar buttonText='Move' onClose={() => closePlanMovePane()} submitFunc={addPlan} />
        </div>
      </Drawer>
      <AddEditPM afterSubmit={afterSubmitPM} open={isScheduleListDrawerOpen} setToastMsg={Toast} plan={activePlan} onClose={() => setScheduleListDrawerOpen(false)} />
      <DialogPrompt title='Delete Category' text='Are you sure you want to delete this Category ?' open={isDeleteCategoryOpen} ctaText='Delete' action={deleteCategoryItem} handleClose={() => setDeleteCategory(false)} />
      <DialogPrompt title='Delete Plan' text='Are you sure you want to delete this Plan ?' open={isDeletePlanOpen} ctaText='Delete' action={deletePlanItem} handleClose={() => setDeletePlan(false)} />
      <DialogPrompt title='Duplicate Plan' text='Are you sure you want to duplicate this Plan ?' open={isDuplicatePlanOpen} ctaText='Duplicate' action={duplicatePlanItem} handleClose={() => setDuplicatePlan(false)} duplicate />
    </div>
  )
}

export default PMSettings
