import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty, orderBy } from 'lodash'

import { ItemContainer, Section, EmptySection } from 'components/preventative-maintenance/common/components'
import { TableComponent } from 'components/common/table-components'
import { ActionButton } from 'components/common/buttons'
import DialogPrompt from 'components/DialogPrompt'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import VerticalSplitOutlinedIcon from '@material-ui/icons/VerticalSplitOutlined'

import NewPlan from 'components/preventative-maintenance/master/new-plan'
import AddEditPM from 'components/preventative-maintenance/common/add-edit-pm'
import ViewPM from 'components/preventative-maintenance/common/view-pm'
import ViewForm from 'components/preventative-maintenance/forms/view-form'
import ThermographyForm from 'components/preventative-maintenance/forms/thermography-form'
import { typeOptions, timePeriodObj } from 'components/preventative-maintenance/common/utils'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { Toast } from 'Snackbar/useToast'

const PreventativeMaintenance = ({ pmCategoryId = null }) => {
  // category
  const isFromClassDetails = pmCategoryId !== null

  const { initialLoading: categoryLoading, data: categories, reFetch: reFetchCategories } = useFetchData({ fetch: preventativeMaintenance.category.getAll, formatter: d => get(d, 'data.list', []), defaultValue: [], condition: !isFromClassDetails })
  const [activeCategoryId, setActiveCategoryId] = useState(pmCategoryId ? pmCategoryId : '')
  // plans
  const { initialLoading: planLoading, data: plans, reFetch: reFetchPlans } = useFetchData({ fetch: preventativeMaintenance.plans.getPlans, payload: { id: activeCategoryId }, formatter: d => get(d, 'data.list', []), defaultValue: [], condition: !isEmpty(activeCategoryId) })
  const noPlansMsg = (
    <>
      No plans in this category , <br /> click new to add plan
    </>
  )
  const emplyPlansMessage = isEmpty(activeCategoryId) ? 'No category selected' : noPlansMsg
  const [activePlanId, setActivePlanId] = useState('')
  const [isNewPlanDrawerOpen, setIsNewPlanDrawerOpen] = useState(false)
  const [isEditPlanDrawerOpen, setIsEditPlanDrawerOpen] = useState(false)
  const [isDeletePlanPromptOpen, setDeletePlanPromptOpen] = useState(false)
  const [isMarkDefault, setMarkDefault] = useState(false)

  const menuOptions = [
    { id: 1, name: 'Edit', action: d => editPlan(d) },
    { id: 2, name: 'Delete', color: '#FF0000', action: d => deletePlanPrompt(d) },
    { id: 3, name: 'Mark as Default', action: d => markDefaultPrompt(d) },
  ]
  // pms
  const { initialLoading: pmLoading, data: pms, reFetch: reFetchPms } = useFetchData({ fetch: preventativeMaintenance.pm.get, payload: { id: activePlanId }, formatter: d => get(d, 'data.list', []), defaultValue: [], condition: !isEmpty(activePlanId) })
  const columns = [
    { name: 'Title', accessor: 'title' },
    {
      name: 'Type',
      render: d => {
        const type = typeOptions.find(x => x.value === d.pmTriggerType)
        if (!type) return 'NA'
        return type.label
      },
    },
    {
      name: 'Estimated Time (In Minutes)',
      render: d => {
        return get(d, 'estimationTime', null) ? get(d, 'estimationTime', 'N/A') : 'N/A'
      },
    },
    {
      name: 'Frequency',
      render: d => {
        if (isEmpty(d.pmTriggerConditionMappingResponseModel)) return 'NA'
        const conditions = orderBy(d.pmTriggerConditionMappingResponseModel, z => z.conditionTypeId)
        return (
          <div>
            {conditions.map(x => (
              <div key={x.pmTriggerConditionMappingId}>
                Repeats Every {x.datetimeRepeatesEvery} {timePeriodObj[x.datetimeRepeatTimePeriodType]}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton isLoading={fetchingId === d.pmId} action={e => onEditPM(e, d)} icon={<EditOutlinedIcon fontSize='small' />} tooltip='EDIT' />
          <ActionButton isLoading={formViewingId === d.pmId} action={e => onViewForm(e, d)} icon={<VerticalSplitOutlinedIcon fontSize='small' />} tooltip='VIEW FORM' />
          <ActionButton action={e => deletePMPrompt(e, d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} tooltip='DELETE' />
          <ActionButton hide={viewingId !== d.pmId} isLoading={viewingId === d.pmId} />
        </div>
      ),
    },
  ]
  const [isAddPMOpen, setAddPMOpen] = useState(false)
  const [isEditPMOpen, setEditPMOpen] = useState(false)
  const [isViewPMOpen, setViewPMOpen] = useState(false)
  const [isDeletePMPromptOpen, setDeletePMPromptOpen] = useState(false)
  const [fetchingId, setFetchingId] = useState('')
  const [viewingId, setViewingId] = useState('')
  const [formViewingId, setFormViewingId] = useState('')
  // others
  const [anchorObj, setAnchorObj] = useState({})
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [defaultLoading, setDefaultLoading] = useState(false)
  // forms
  const [isViewFormOpen, setViewFormOpen] = useState(false)
  const [isViewThermographyFormOpen, setViewThermographyFormOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const detailObj = { assetClassName: !isEmpty(categories) && !isEmpty(categories.find(e => e.pmCategoryId === activeCategoryId)) ? categories.find(e => e.pmCategoryId === activeCategoryId).categoryName : null }
  // category functions
  const onCategoryClick = id => {
    setActiveCategoryId(id)
    setActivePlanId('')
  }
  // plan functions
  const editPlan = data => {
    setAnchorObj(data)
    setIsEditPlanDrawerOpen(true)
  }
  const afterPlanSubmit = () => {
    reFetchCategories()
    reFetchPlans()
  }
  const deletePlanPrompt = data => {
    setAnchorObj(data)
    setDeletePlanPromptOpen(true)
  }
  const markDefaultPrompt = data => {
    setAnchorObj(data)
    setMarkDefault(true)
  }
  const deletePlan = async () => {
    setDeleteLoading(true)
    try {
      const res = await preventativeMaintenance.plans.delete({ id: anchorObj.pmPlanId })
      if (res.success > 0) Toast.success(`Plan Deleted Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error deleting Plan. Please try again !`)
    }
    if (activePlanId === anchorObj.pmPlanId) setActivePlanId('')
    setDeleteLoading(false)
    setDeletePlanPromptOpen(false)
    afterPlanSubmit()
  }
  const markDefaultPlan = async () => {
    setDefaultLoading(true)
    try {
      const res = await preventativeMaintenance.plans.markDefault({ pmPlanId: anchorObj.pmPlanId })
      if (res.success > 0) {
        Toast.success(`Plan Mark as Default Successfully !`)
        reFetchPlans()
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error Marking as Default Plan. please try again !`)
    }
    setDefaultLoading(false)
    setMarkDefault(false)
  }
  //pm functions
  const afterPMSubmit = () => {
    reFetchPlans()
    reFetchPms()
  }
  const deletePMPrompt = (e, data) => {
    e.stopPropagation()
    setAnchorObj(data)
    setDeletePMPromptOpen(true)
  }
  const deletePM = async () => {
    setDeleteLoading(true)
    try {
      const res = await preventativeMaintenance.pm.delete({ id: anchorObj.pmId })
      if (res.success > 0) Toast.success(`PM Deleted Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error deleting PM. Please try again !`)
    }
    setDeleteLoading(false)
    setDeletePMPromptOpen(false)
    afterPMSubmit()
  }
  const onEditPM = async (e, data) => {
    e.stopPropagation()
    setFetchingId(data.pmId)
    const dataFetched = await fetchPM(data.pmId)
    setFetchingId('')
    if (dataFetched) setEditPMOpen(true)
  }
  const onViewPM = async data => {
    setViewingId(data.pmId)
    const dataFetched = await fetchPM(data.pmId)
    setViewingId('')
    if (dataFetched) setViewPMOpen(true)
  }
  const fetchPM = async id => {
    try {
      const res = await preventativeMaintenance.pm.getById({ id })
      if (res.success > 0) {
        setAnchorObj(res.data)
        return true
      } else throw new Error()
    } catch (error) {
      Toast.error(`Error fetching PM. Please try again !`)
      return false
    }
  }
  const onViewForm = async (e, data) => {
    e.stopPropagation()
    try {
      if (data.pmInspectionTypeId === 1) return setViewThermographyFormOpen(true)
      setFormViewingId(data.pmId)
      const res = await preventativeMaintenance.forms.get({ id: data.pmId })
      if (res.success > 0) {
        const form = get(res, 'data.formJson', '{}') || '{}'
        setFormData(JSON.parse(form))
        setViewFormOpen(true)
        setFormViewingId('')
        return true
      } else throw new Error()
    } catch (error) {
      setFormViewingId('')
      Toast.error(`Error fetching Form. Please try again !`)
    }
  }

  //
  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)' }}>
      <div className='d-flex' style={{ height: '100%' }}>
        {/* CATEGORIES */}
        {isFromClassDetails ? null : (
          <Section loading={categoryLoading} title='Class / Category' noAction={true}>
            {categories.map(({ pmCategoryId, categoryName, pmPlansCount }) => (
              <ItemContainer id={pmCategoryId} onClick={() => onCategoryClick(pmCategoryId)} count={pmPlansCount} key={pmCategoryId} isActive={pmCategoryId === activeCategoryId} title={categoryName} />
            ))}
          </Section>
        )}
        {/* PLANS */}
        <Section loading={planLoading} isActionDisabled={isEmpty(activeCategoryId)} title='Plans' onAction={() => setIsNewPlanDrawerOpen(true)}>
          {isEmpty(plans) ? (
            <EmptySection message={emplyPlansMessage} />
          ) : (
            plans.map(({ pmPlanId, planName, pmCount, isDefaultPmPlan }) => (
              <ItemContainer data={{ pmPlanId, planName, pmCount, isDefaultPmPlan }} hasMenu menuOptions={menuOptions} id={pmPlanId} onClick={() => setActivePlanId(pmPlanId)} count={pmCount} key={pmPlanId} isActive={pmPlanId === activePlanId} title={planName} isPMsTab={isFromClassDetails} isDefaultIcon />
            ))
          )}
        </Section>
        {/* PMs */}
        <Section style={{ width: 'calc(100vw - 500px)', borderRight: isFromClassDetails ? '0px solid #EAEAEA' : '1px solid #EAEAEA' }} isActionDisabled={isEmpty(activePlanId)} title='PM' onAction={() => setAddPMOpen(true)}>
          {isEmpty(activePlanId) ? (
            <EmptySection message='No Plan selected' />
          ) : (
            <div className='p-2' style={{ height: '100%' }}>
              <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: '99%' }}>
                <TableComponent loading={pmLoading} columns={columns} data={pms} onRowClick={d => onViewPM(d)} isForViewAction={true} />
              </div>
            </div>
          )}
        </Section>
      </div>
      {/* POP-UPS */}
      {isNewPlanDrawerOpen && <NewPlan open={isNewPlanDrawerOpen} onClose={() => setIsNewPlanDrawerOpen(false)} pmCategoryId={activeCategoryId} afterSubmit={afterPlanSubmit} isNew />}
      {isEditPlanDrawerOpen && <NewPlan obj={anchorObj} open={isEditPlanDrawerOpen} onClose={() => setIsEditPlanDrawerOpen(false)} pmCategoryId={activeCategoryId} afterSubmit={afterPlanSubmit} />}
      {isAddPMOpen && <AddEditPM open={isAddPMOpen} afterSubmit={afterPMSubmit} onClose={() => setAddPMOpen(false)} pmPlanId={activePlanId} />}
      {isEditPMOpen && <AddEditPM obj={anchorObj} open={isEditPMOpen} afterSubmit={afterPMSubmit} onClose={() => setEditPMOpen(false)} pmPlanId={activePlanId} isEdit />}
      {isViewPMOpen && <ViewPM open={isViewPMOpen} onClose={() => setViewPMOpen(false)} obj={anchorObj} />}
      {isViewFormOpen && <ViewForm isView open={isViewFormOpen} onClose={() => setViewFormOpen(false)} data={formData} />}
      {isViewThermographyFormOpen && <ThermographyForm isView open={isViewThermographyFormOpen} onClose={() => setViewThermographyFormOpen(false)} data={formData} obj={detailObj} />}
      <DialogPrompt title='Mark Default' text='Are you sure you want to Mark Default ?' actionLoader={defaultLoading} open={isMarkDefault} ctaText='Mark Default' action={markDefaultPlan} handleClose={() => setMarkDefault(false)} />
      <DialogPrompt title='Delete Plan' text='Are you sure you want to delete this plan ?' actionLoader={deleteLoading} open={isDeletePlanPromptOpen} ctaText='Delete' action={deletePlan} handleClose={() => setDeletePlanPromptOpen(false)} />
      <DialogPrompt title='Delete PM' text='Are you sure you want to delete this pm ?' actionLoader={deleteLoading} open={isDeletePMPromptOpen} ctaText='Delete' action={deletePM} handleClose={() => setDeletePMPromptOpen(false)} />
    </div>
  )
}

export default PreventativeMaintenance
