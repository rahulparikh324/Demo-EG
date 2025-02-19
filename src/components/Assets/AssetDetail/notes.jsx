import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTheme } from '@material-ui/core/styles'

import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined'
import SendIcon from '@material-ui/icons/Send'
//
import notes from 'Services/Asset/asset-notes'
import { isEmpty, get, groupBy } from 'lodash'
import { Toast } from 'Snackbar/useToast'
import { getFormatedDate } from 'helpers/getDateTime'
import { FloatingButton } from 'components/common/buttons'
import CircularProgress from '@material-ui/core/CircularProgress'
import getUserRole from 'helpers/getUserRole'

const Notes = ({ assetId }) => {
  const theme = useTheme()
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [noteList, setNoteList] = useState({})
  const [noteListLoading, setNoteListLoading] = useState(false)
  const [refetch, setRefetch] = useState(0)
  const [fetchingMore, setFetchingMore] = useState(false)
  const scrollRef = useRef(null)
  const observer = useRef()
  let initialLoad = true
  let hasMore = true
  let pageIndex = 1
  let totalPages = 0
  let rawList = []
  const checkUserRole = new getUserRole()
  //
  useEffect(() => {
    ;(async () => {
      try {
        setNoteListLoading(true)
        const res = await notes.get({ assetId, pageIndex: 1, pageSize: 20 })
        const list = get(res, 'data.list', []).reverse()
        rawList = [...list]
        const listSize = get(res, 'data.listsize', 1)
        totalPages = Math.ceil(listSize / 20)
        hasMore = totalPages > 1
        const updatedList = []
        const today = new Date().getDate()
        list.forEach(d => {
          const date = new Date(getFormatedDate(d.createdAt, true))
          let dateText
          if (date.getDate() === today) dateText = 'Today'
          else if (date.getDate() === today - 1) dateText = 'Yesterday'
          else dateText = getFormatedDate(d.createdAt)
          updatedList.push({ ...d, dateText })
        })
        setNoteList(groupBy(updatedList, d => d.dateText))

        if (scrollRef) {
          setTimeout(() => {
            const scrollTo = scrollRef.current.scrollHeight > 1000 ? scrollRef.current.scrollHeight : 1000
            scrollRef.current.scroll({ top: scrollTo, behavior: 'smooth' })
            initialLoad = false
          }, 300)
        }
        setNoteListLoading(false)
      } catch (error) {
        console.log(error)
      }
    })()
  }, [refetch])

  const nextPage = async () => {
    if (!initialLoad && hasMore) {
      setFetchingMore(true)
      try {
        const res = await notes.get({ assetId, pageIndex: pageIndex + 1, pageSize: 4 })
        pageIndex += 1
        hasMore = totalPages > pageIndex
        const list = get(res, 'data.list', []).reverse()
        rawList = [...list, ...rawList]
        const updatedList = []
        const today = new Date().getDate()
        rawList.forEach(d => {
          const date = new Date(getFormatedDate(d.createdAt, true))
          let dateText
          if (date.getDate() === today) dateText = 'Today'
          else if (date.getDate() === today - 1) dateText = 'Yesterday'
          else dateText = getFormatedDate(d.createdAt)
          updatedList.push({ ...d, dateText })
        })
        setNoteList(groupBy(updatedList, d => d.dateText))
        setFetchingMore(false)
      } catch (error) {}
    }
  }
  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) nextPage()
    })
    if (node) observer.current.observe(node)
  }, [])

  const send = async () => {
    if (!isEmpty(note.trim())) {
      try {
        setSending(true)
        const res = await notes.add({ assetId, assetNote: note })
        if (res.success > 0) {
          Toast.success('Note added successfully !')
          setNote('')
          setRefetch(p => p + 1)
        } else Toast.error(res.message)
        setSending(false)
      } catch (error) {
        Toast.error('Something went wrong !')
        setSending(false)
      }
    }
  }
  //
  const Note = ({ data }) => {
    return (
      <div className='p-2 mb-2 border' style={{ borderRadius: '4px', width: '100%' }}>
        <div className='d-flex justify-content-between mb-2' style={{ fontWeight: 800 }}>
          <div>{data.assetNoteAddedByUser}</div>
          <div>{getFormatedDate(data.createdAt, true).slice(11)}</div>
        </div>
        <div>{data.assetNote}</div>
      </div>
    )
  }
  const renderNotesContanier = () => {
    return (
      <>
        {fetchingMore && (
          <div className='d-flex justify-content-center align-items-center mb-2' style={{ width: '100%' }}>
            <CircularProgress size={20} thickness={5} />
          </div>
        )}
        {Object.keys(noteList).map((d, index) => (
          <React.Fragment key={d}>
            <div ref={index === 0 ? lastElementRef : null} className='d-flex justify-content-between align-items-center mb-2' style={{ fontWeight: 800, fontSize: '12px', color: '#5e5e5e', width: '100%' }}>
              <hr style={{ width: 'inherit', borderTop: '1px solid #a4a4a4', margin: '0 8px' }} />
              <span style={{ width: '60%', textAlign: 'center' }}>{d}</span>
              <hr style={{ width: 'inherit', borderTop: '1px solid #a4a4a4', margin: '0 8px' }} />
            </div>
            {noteList[d].map(note => (
              <Note key={note.assetNotesId} data={note} />
            ))}
          </React.Fragment>
        ))}
      </>
    )
  }
  const renderInitialLoader = () => (
    <div style={{ height: 'calc(100%)', fontWeight: 800, gap: '12px' }} className='d-flex flex-column justify-content-center align-items-center'>
      <CircularProgress size={24} thickness={5} />
    </div>
  )
  const renderEmptyState = () => (
    <div style={{ height: 'calc(100%)', fontWeight: 800, gap: '12px' }} className='d-flex flex-column justify-content-center align-items-center'>
      <ChatBubbleOutlineOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />
      <div style={{ color: '#666', marginTop: '12px' }}>No Notes !</div>
    </div>
  )
  return (
    <>
      <div ref={scrollRef} className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 164px)', height: 'calc(100vh - 164px)', padding: '8px', display: 'flex !important', flexSirection: 'column', justifyContent: 'flex-end' }}>
        {noteListLoading ? renderInitialLoader() : isEmpty(noteList) ? renderEmptyState() : renderNotesContanier()}
      </div>
      {checkUserRole.isCompanyAdmin() === false && (
        <div className='d-flex align-items-center p-2'>
          <input type='text' value={note} onKeyDown={e => e.key === 'Enter' && send()} onChange={e => setNote(e.target.value)} placeholder='Send Notes' className={`minimal-input-base`} />
          <FloatingButton isLoading={sending} onClick={send} icon={<SendIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
        </div>
      )}
    </>
  )
}

export default Notes
