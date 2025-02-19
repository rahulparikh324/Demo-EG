import React, { useState, useEffect } from 'react'
import getWOBacklogCardList from '../../Services/WorkOrder/getWOBacklogCardList'
import CircularProgress from '@material-ui/core/CircularProgress'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import enums from '../../Constants/enums'
import $ from 'jquery'
import updateWOStatus from '../../Services/WorkOrder/updateWOStatus'
import { Toast } from '../../Snackbar/useToast'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { getFormatedDate } from '../../helpers/getDateTime'
import { workOrderTypesPath } from './utils'
import DialogPrompt from 'components/DialogPrompt'

let initialColumnList = {
  [uuidv4()]: {
    title: 'Planned',
    items: [],
    status_id: enums.woTaskStatus.Planned,
    color_code: '#ED3FDC99',
  },
  [uuidv4()]: {
    title: 'Released Open',
    items: [],
    status_id: enums.woTaskStatus.ReleasedOpen,
    color_code: '#003DDA99',
  },
  [uuidv4()]: {
    title: 'In Progress',
    items: [],
    status_id: enums.woTaskStatus.InProgress,
    color_code: '#3291DD99',
  },
  [uuidv4()]: {
    title: 'On Hold',
    items: [],
    status_id: enums.woTaskStatus.Hold,
    color_code: '#FF9D3399',
  },
  [uuidv4()]: {
    title: 'Completed',
    items: [],
    status_id: enums.woTaskStatus.Complete,
    color_code: '#5D8C2199',
  },
}
function Backlogs() {
  const [columns, setColumns] = useState(initialColumnList)
  const [backlogDetail, setBacklogDetail] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false)
  const [isStatusChangeLoading, setIsStatusChangeLoading] = useState(false)
  const [detailObj, setDetailObj] = useState({})
  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      $('#pageLoading').show()
      try {
        const reqData = {
          search_string: searchString,
          site_id: JSON.parse(localStorage.getItem('siteListForWO')),
        }
        const res = await getWOBacklogCardList(reqData)
        if (res.success > 0) {
          let isDataExist = false
          if (res.data == null || (res.data != null && _.isEmpty(res.data.planned) && _.isEmpty(res.data.released_open) && _.isEmpty(res.data.in_progress) && _.isEmpty(res.data.on_hold) && _.isEmpty(res.data.complete))) {
            isDataExist = false
            setBacklogDetail(null)
          } else {
            isDataExist = true
            setBacklogDetail(res.data)
          }
          // let columnItemList = Object.keys(columns).map((k) => ({ ...columns[k], id: k }));
          let columnItemList = Object.keys(columns)
          if (columnItemList != null && columnItemList.length > 0 && res.data != null && isDataExist) {
            columnItemList.forEach(e => {
              let detail = columns[e]
              if (detail.status_id === enums.woTaskStatus.Planned) {
                detail.items = _.isEmpty(res.data.planned) ? [] : res.data.planned
              } else if (detail.status_id === enums.woTaskStatus.ReleasedOpen) {
                detail.items = _.isEmpty(res.data.released_open) ? [] : res.data.released_open
              } else if (detail.status_id === enums.woTaskStatus.InProgress) {
                detail.items = _.isEmpty(res.data.in_progress) ? [] : res.data.in_progress
              } else if (detail.status_id === enums.woTaskStatus.Hold) {
                detail.items = _.isEmpty(res.data.on_hold) ? [] : res.data.on_hold
              } else if (detail.status_id === enums.woTaskStatus.Complete) {
                detail.items = _.isEmpty(res.data.complete) ? [] : res.data.complete
              }
            })
          }
          setLoading(false)
          $('#pageLoading').hide()
        } else {
          $('#pageLoading').hide()
          setBacklogDetail(null)
          Toast.error(res.message)
        }
      } catch (error) {
        setLoading(false)
        setBacklogDetail(null)
        $('#pageLoading').hide()
      }
    })()
  }, [searchString])

  const onDragEnd = async result => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId]
      const destColumn = columns[destination.droppableId]
      if (destColumn.status_id === enums.woTaskStatus.Complete) {
        Toast.error('You are not allowed to complete work order from here, please go to work order detail page and complete it')
        return
      } else {
        const status_change_text = 'Are you sure you want to change status from ' + sourceColumn.title + ' -> ' + destColumn.title + ' ?'
        setDetailObj({ source, destination, status_change_text })
        setIsStatusChangeModalOpen(true)
        return
      }
    } else {
      const column = columns[source.droppableId]
      const copiedItems = [...column.items]
      const [removed] = copiedItems.splice(source.index, 1)
      copiedItems.splice(destination.index, 0, removed)
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      })
    }
  }

  const BacklogDetailUI = (item, index, snapshot) => {
    const isDragDisabled = item.wo_status_id === enums.woTaskStatus.Complete ? true : false
    return (
      <div className='backlog-detail' key={index} style={{ backgroundColor: isDragDisabled ? '#eeeeee' : '' }}>
        <div className='backlog-detail-title'>
          <b>WO# {item.manual_wo_number}</b>
        </div>
        <div className='secondary-details'>
          <p> {item.description} </p>
          <p> Facility - {item.site_name}</p>
          <p>{getFormatedDate(item.start_date.split('T')[0])}</p>
        </div>
      </div>
    )
  }

  const getBorderClassByStatus = status => {
    if (status === enums.woTaskStatus.Planned) return 'wocolumn-1-border-left'
    if (status === enums.woTaskStatus.ReleasedOpen) return 'wocolumn-2-border-left'
    if (status === enums.woTaskStatus.InProgress) return 'wocolumn-3-border-left'
    if (status === enums.woTaskStatus.Hold) return 'wocolumn-4-border-left'
    if (status === enums.woTaskStatus.Complete) return 'wocolumn-5-border-left'
  }

  const clickWoOrderDetail = item => window.open(`${workOrderTypesPath[item.wo_type]['path']}/${item.wo_id}`, '_blank')

  const handleSearchOnKeyDown = e => {
    setSearchString(searchStringValue)
  }

  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
  }

  const handleStatusChange = async () => {
    const { source, destination } = detailObj
    const destColumn = columns[destination.droppableId]
    const sourceColumn = columns[source.droppableId]
    const sourceItems = [...sourceColumn.items]
    const destItems = [...destColumn.items]
    const [removed] = sourceItems.splice(source.index, 1)
    destItems.splice(destination.index, 0, removed)
    let payload = {
      wo_id: removed.wo_id,
      status: destColumn.status_id,
    }
    setIsStatusChangeLoading(true)
    try {
      const res = await updateWOStatus(payload)
      if (res.success > 0) {
        setIsStatusChangeModalOpen(false)
        setIsStatusChangeLoading(false)
        Toast.success('Workorder Status Changed Successfully!')
        if (destItems.some(x => x.wo_status_id != destColumn.status_id)) {
          destItems.filter(x => x.wo_status_id != destColumn.status_id).map(y => (y.wo_status_id = destColumn.status_id))
        }
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
          [destination.droppableId]: {
            ...destColumn,
            items: destItems,
          },
        })
      } else {
        setIsStatusChangeLoading(false)
        Toast.error('Error while updating workorder. Please try again !')
      }
    } catch (error) {
      setIsStatusChangeLoading(false)
      Toast.error('Error while updating workorder. Please try again !')
    }
  }
  //
  return (
    <div style={{ height: '93vh', background: '#fff' }} className='backlogscreen'>
      <div className='bg-white' style={{ height: '100%', borderRadius: '4px', padding: '16px' }}>
        <div className='' style={{ maxHeight: '700px', height: '700px' }}>
          <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%', marginBottom: '16px' }}>
            <div></div>
            <div>
              <Input
                placeholder='Search'
                startAdornment={
                  <InputAdornment position='start'>
                    <SearchOutlined color='primary' />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment className='pointerCursor' position='end' onClick={clearSearch}>
                    {searchStringValue ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
                  </InputAdornment>
                }
                value={searchStringValue}
                onChange={e => setSearchStringValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchOnKeyDown()}
              />
            </div>
          </div>
          <DragDropContext onDragEnd={result => onDragEnd(result)}>
            <div className='backlog-container'>
              {Object.entries(columns).map(([columnId, column], index) => {
                return (
                  <div className={`backlog-column-style ${getBorderClassByStatus(column.status_id)}`} key={index}>
                    <div className='title' style={{ backgroundColor: column.color_code }}>
                      {column.title}
                    </div>
                    {!loading && !_.isEmpty(backlogDetail) && (
                      <Droppable key={index} droppableId={columnId}>
                        {(provided, snapshot) => (
                          <div className='backlog-list' ref={provided.innerRef} {...provided.droppableProps}>
                            {column.items.map((item, index) => (
                              <Draggable key={item.wo_id} draggableId={item.wo_id} index={index} isDragDisabled={item.wo_status_id === enums.woTaskStatus.Complete}>
                                {(provided, dragsnapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} key={item.id} onClick={() => clickWoOrderDetail(item)}>
                                    {BacklogDetailUI(item, index, dragsnapshot)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )}
                  </div>
                )
              })}
            </div>
          </DragDropContext>
          {!loading && _.isEmpty(backlogDetail) && <div className='d-flex justify-content-center align-items-center'>No Workorders found !</div>}
          <DialogPrompt title='Change Status' text={detailObj.status_change_text} open={isStatusChangeModalOpen} ctaText='Save' actionLoader={isStatusChangeLoading} action={handleStatusChange} handleClose={() => setIsStatusChangeModalOpen(false)} />
        </div>
      </div>
    </div>
  )
}

export default Backlogs
