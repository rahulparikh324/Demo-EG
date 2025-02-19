import React, { useState, useEffect } from 'react'

import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Toast } from 'Snackbar/useToast'

import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import $ from 'jquery'

import enums from 'Constants/enums'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { getFormatedDate } from 'helpers/getDateTime'
import { quoteTypesPath } from './utils'
import DialogPrompt from 'components/DialogPrompt'
import getQuoteBacklogCardList from 'Services/WorkOrder/getQuoteBacklogCardList'

let initialColumnList = {
  [uuidv4()]: {
    title: 'Open',
    items: [],
    status_id: enums.QUOTES.STATUS.OPEN,
    color_code: '#3941F1',
  },
  [uuidv4()]: {
    title: 'Sent to Customer',
    items: [],
    status_id: enums.QUOTES.STATUS.SUBMITTED,
    color_code: '#DE68A5',
  },
  [uuidv4()]: {
    title: 'Rejected',
    items: [],
    status_id: enums.QUOTES.STATUS.REJECTED,
    color_code: '#DA3B26',
  },
  [uuidv4()]: {
    title: 'Deferred',
    items: [],
    status_id: enums.QUOTES.STATUS.DEFERRED,
    color_code: '#929292',
  },
  [uuidv4()]: {
    title: 'Accepted',
    items: [],
    status_id: enums.QUOTES.STATUS.ACCEPTED,
    color_code: '#37D482',
  },
}

const QuoteBacklogs = () => {
  const [columns, setColumns] = useState(initialColumnList)
  const [backlogDetail, setBacklogDetail] = useState({})
  const [loading, setLoading] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false)
  const [isStatusChangeLoading, setIsStatusChangeLoading] = useState(false)
  const [detailObj, setDetailObj] = useState({})

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      $('#pageLoading').show()
      try {
        const reqData = {
          search_string: searchString,
          site_id: JSON.parse(localStorage.getItem('siteListForWO')),
        }
        const res = await getQuoteBacklogCardList(reqData)
        if (res.success > 0) {
          let isDataExist = false
          if (res.data == null || (res.data != null && _.isEmpty(res.data.open) && _.isEmpty(res.data.submitted) && _.isEmpty(res.data.accepted) && _.isEmpty(res.data.rejected) && _.isEmpty(res.data.deferred))) {
            isDataExist = false
            setBacklogDetail(null)
          } else {
            isDataExist = true
            setBacklogDetail(res.data)
          }
          let columnItemList = Object.keys(columns)
          if (columnItemList != null && columnItemList.length > 0 && res.data != null && isDataExist) {
            columnItemList.forEach(e => {
              let detail = columns[e]
              if (detail.status_id === enums.QUOTES.STATUS.OPEN) {
                detail.items = _.isEmpty(res.data.open) ? [] : res.data.open
              } else if (detail.status_id === enums.QUOTES.STATUS.SUBMITTED) {
                detail.items = _.isEmpty(res.data.submitted) ? [] : res.data.submitted
              } else if (detail.status_id === enums.QUOTES.STATUS.DEFERRED) {
                detail.items = _.isEmpty(res.data.deferred) ? [] : res.data.deferred
              } else if (detail.status_id === enums.QUOTES.STATUS.REJECTED) {
                detail.items = _.isEmpty(res.data.rejected) ? [] : res.data.rejected
              } else if (detail.status_id === enums.QUOTES.STATUS.ACCEPTED) {
                detail.items = _.isEmpty(res.data.accepted) ? [] : res.data.accepted
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

  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
  }

  const handleSearchOnKeyDown = e => {
    setSearchString(searchStringValue)
  }

  const getBorderClassByStatus = status => {
    console.log(status)
    if (status === enums.QUOTES.STATUS.OPEN) return 'quotecolumn-1-border-left'
    if (status === enums.QUOTES.STATUS.SUBMITTED) return 'quotecolumn-2-border-left'
    if (status === enums.QUOTES.STATUS.REJECTED) return 'quotecolumn-3-border-left'
    if (status === enums.QUOTES.STATUS.DEFERRED) return 'quotecolumn-4-border-left'
    if (status === enums.QUOTES.STATUS.ACCEPTED) return 'quotecolumn-5-border-left'
  }

  const BacklogDetailUI = (item, index, snapshot) => {
    const isDragDisabled = item.quote_status_id === enums.QUOTES.STATUS.ACCEPTED ? true : false
    return (
      <div className='backlog-detail' key={index} style={{ backgroundColor: isDragDisabled ? '#eeeeee' : '' }}>
        <div className='backlog-detail-title'>
          <b>QUOTE# {item.manual_wo_number}</b>
        </div>
        <div className='secondary-details'>
          <p> {item.description} </p>
          <p> Facility - {item.site_name}</p>
          <p>{getFormatedDate(item.start_date.split('T')[0])}</p>
        </div>
      </div>
    )
  }

  const clickQuoteDetail = item => window.open(`${quoteTypesPath[item.wo_type]['path']}/${item.wo_id}`, '_blank')

  const onDragEnd = async result => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId]
      const destColumn = columns[destination.droppableId]
      if (destColumn.status_id === enums.QUOTES.STATUS.ACCEPTED) {
        Toast.error('You are not allowed to accept quote from here, please go to quote detail page and accept it')
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
      quote_status: destColumn.status_id,
    }
    setIsStatusChangeLoading(true)
    try {
      const res = await onBoardingWorkorder.changeQuoteStatus(payload)
      if (res.success > 0) {
        setIsStatusChangeModalOpen(false)
        setIsStatusChangeLoading(false)
        Toast.success('Quote Status Changed Successfully!')
        if (destItems.some(x => x.quote_status_id != destColumn.status_id)) {
          destItems.filter(x => x.quote_status_id != destColumn.status_id).map(y => (y.quote_status_id = destColumn.status_id))
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
        Toast.error('Error while updating quote. Please try again !')
      }
    } catch (error) {
      setIsStatusChangeLoading(false)
      Toast.error('Error while updating quote. Please try again !')
    }
  }

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
                              <Draggable key={item.wo_id} draggableId={item.wo_id} index={index} isDragDisabled={item.quote_status_id === enums.QUOTES.STATUS.ACCEPTED}>
                                {(provided, dragsnapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} key={item.id} onClick={() => clickQuoteDetail(item)}>
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
          {!loading && _.isEmpty(backlogDetail) && <div className='d-flex justify-content-center align-items-center'>No Quotes found !</div>}
          <DialogPrompt title='Change Status' text={detailObj.status_change_text} open={isStatusChangeModalOpen} ctaText='Save' actionLoader={isStatusChangeLoading} action={handleStatusChange} handleClose={() => setIsStatusChangeModalOpen(false)} />
        </div>
      </div>
    </div>
  )
}

export default QuoteBacklogs
