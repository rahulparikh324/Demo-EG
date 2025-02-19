import React, { useState, useContext } from 'react'

import useFetchData from 'hooks/fetch-data'
import { snakifyKeys } from 'helpers/formatters'
import enums from 'Constants/enums'

import issues from 'Services/issues'
import { Toast } from 'Snackbar/useToast'

import { get, isEmpty } from 'lodash'
import { StatusComponent } from 'components/common/others'
import { CommentHeader, Comment } from 'components/Issues/components'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { statusChipOptions, priorityOptions, getChip } from './utlis'
import { AssetImage } from 'components/WorkOrders/onboarding/utils'
import ImagePreview from 'components/common/image-preview'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import LinkOffOutlinedIcon from '@material-ui/icons/LinkOffOutlined'

import Edit from 'components/Issues/edit'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'
import { history } from 'helpers/history'
import getUserRole from 'helpers/getUserRole'
import { handleCompanyAccess } from 'Services/getCompanyAccess'
import { MainContext } from 'components/Main/provider'

const IssueDetails = ({ issueId }) => {
  const userRole = new getUserRole()
  //details
  const handleFormatter = data => {
    handleCompanyAccess({ companyId: get(data, 'clientCompanyId', null), siteId: get(data, 'siteId', null), siteName: get(data, 'siteName', ''), companyName: get(data, 'clientCompanyName', '') }, context, 'Issue')
    return data
  }
  const { data, reFetch: afterSubmit } = useFetchData({ fetch: issues.getDetailById, payload: issueId, formatter: d => handleFormatter(get(d, 'data', {})), externalLoader: true })
  const { color, label } = getChip(data.issueStatus, statusChipOptions)
  const { color: priorityColor, label: priorityLabel } = getChip(data.priority, priorityOptions)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  //comments
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const { data: comments, loading: commentsLoading, reFetch } = useFetchData({ fetch: issues.getComments, payload: snakifyKeys({ pageSize: 0, pageIndex: 0, searchString: null, assetIssueId: issueId }), formatter: d => get(d, 'data.list', []) })
  const [isPreviewOpen, setPreview] = useState([false, 0])
  const [unlinking, setUnlinking] = useState(false)
  const [imageOrder, setImageOrder] = useState(0)
  const [randomValue, setRandomValue] = useState(Math.random())
  const context = useContext(MainContext)

  const location = useLocation()
  //
  const parse = key => get(data, [key], 'NA') || 'NA'
  const postComment = async () => {
    if (!isEmpty(comment.trim())) {
      try {
        setSending(true)
        const res = await issues.addComment(snakifyKeys({ assetIssueId: issueId, comment }))
        if (res.success > 0) {
          Toast.success('Comment added successfully !')
          setComment('')
          reFetch()
        } else Toast.error(res.message)
        setSending(false)
      } catch (error) {
        Toast.error('Something went wrong !')
        setSending(false)
      }
    }
  }
  const edit = () => {
    setAnchorObj(data)
    setIsEditOpen(true)
  }
  const unlink = async () => {
    try {
      setUnlinking(true)
      const res = await issues.unlinkIssueFromWorkOrder(snakifyKeys({ assetIssueId: [data.assetIssueId] }))
      if (res.success > 0) {
        Toast.success('Issue unlinked successfully !')
        reFetch()
        afterSubmit()
      } else Toast.error(res.message)
      setUnlinking(false)
    } catch (error) {
      Toast.error('Something went wrong !')
      setUnlinking(false)
    }
  }
  //
  const renderInitialLoader = () => (
    <div style={{ height: 'calc(100%)', fontWeight: 800, gap: '12px' }} className='d-flex flex-column justify-content-center align-items-center'>
      <CircularProgress size={24} thickness={5} />
    </div>
  )
  const renderEmptyState = () => (
    <div style={{ height: 'calc(100%)', fontWeight: 800, gap: '12px' }} className='d-flex flex-column justify-content-center align-items-center'>
      <ChatBubbleOutlineOutlinedIcon style={{ fontSize: '32px', color: '#666' }} />
      <div style={{ color: '#666', marginTop: '12px' }}>No Comments added !</div>
    </div>
  )
  const issueDetails = {
    filter: get(location, 'state.filter', [[73, 13, 69]]),
    pageRows: get(location, 'state.pageRows', 20),
    search: get(location, 'state.search', ''),
    pageIndex: get(location, 'state.pageIndex', 1),
    page: get(location, 'state.page', 0),
  }
  return (
    <div className='d-flex' style={{ background: '#fff', height: 'calc(100vh - 64px)' }}>
      <div style={{ width: '70%', borderRight: '1px solid #dee2e6', padding: '20px' }}>
        <div className='d-flex justify-content-between mb-5'>
          <div className='d-flex align-items-center'>
            <div className='mr-2'>
              <ActionButton
                icon={<ArrowBackIcon fontSize='small' />}
                action={() => history.push({ pathname: '/issues', state: { filter: get(history, 'location.state.filter', null), search: get(history, 'location.state.search', ''), pageRows: get(history, 'location.state.pageRows', 20), pageIndex: get(history, 'location.state.pageIndex', 1) } })}
                tooltip='GO BACK'
              />
            </div>
            <div className='text-bold mr-2 text-md'>{parse('issueTitle').split('_').join(' - ')}</div>
            <StatusComponent color={color} label={label} size='medium' />
          </div>
          <ActionButton hide={data.issueStatus === enums.ISSUE.STATUS.RESOLVED} tooltip='EDIT' action={edit} icon={<EditOutlinedIcon fontSize='small' />} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '19% 81%', rowGap: '24px' }}>
          <div className='text-bold'>Issue#</div>
          <div>{parse('issueNumber')}</div>
          <div className='text-bold'>Asset</div>
          <div>
            {data.assetName ? (
              <div onClick={e => window.open(`/assets/details/${data.assetId}`)} className='text-bold' style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                {data.assetName}
              </div>
            ) : (
              'NA'
            )}
          </div>
          <div className='text-bold'>WO #</div>
          <div className='d-flex align-items-center'>
            {data.manualWoNumber ? (
              <div onClick={e => window.open(`/workorders/details/${data.woId}`)} className='text-bold mr-3' style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                {data.manualWoNumber}
              </div>
            ) : (
              'NA'
            )}
            <ActionButton isLoading={unlinking} hide={!data.manualWoNumber || data.issueStatus === enums.ISSUE.STATUS.RESOLVED} tooltip='UNLINK WORK ORDER' action={unlink} icon={<LinkOffOutlinedIcon fontSize='small' />} />
          </div>
          <div className='text-bold'>Description</div>
          <div>{parse('issueDescription')}</div>
          <div className='text-bold'>Priority</div>
          <div>
            <StatusComponent color={priorityColor} label={priorityLabel} size='medium' />
          </div>
          {/* <div className='text-bold'>Back Office Note</div>
          <div>{parse('backOfficeNote')}</div>
          <div className='text-bold'>Field Note</div>
          <div>{parse('fieldNote')}</div> */}
          <div className='text-bold'>Before Photos</div>
          <div className='pb-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
            {get(data, 'issueImageList', [])
              .filter(d => d.imageDurationTypeId === 1)
              .map((d, index) => d.imageDurationTypeId === 1 && <AssetImage readOnly onClick={() => (setPreview([true, 1]), setImageOrder(index))} key={`asset-image-${d.assetIssueImageMappingId}`} url={`${d.imageFileNameUrl}?value=${randomValue}`} randomValue />)}
          </div>
          <div className='text-bold'>After Photos</div>
          <div className='pb-3 mb-2 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
            {get(data, 'issueImageList', [])
              .filter(d => d.imageDurationTypeId === 2)
              .map((d, index) => d.imageDurationTypeId === 2 && <AssetImage readOnly onClick={() => (setPreview([true, 2]), setImageOrder(index))} key={`asset-image-${d.assetIssueImageMappingId}`} url={`${d.imageFileNameUrl}?value=${randomValue}`} randomValue />)}
          </div>
        </div>
      </div>
      <div style={{ width: '30%' }}>
        <CommentHeader />
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 190px)', height: 'calc(100vh - 190px)' }}>
          {commentsLoading ? renderInitialLoader() : isEmpty(comments) ? renderEmptyState() : comments.map(d => <Comment key={d.assetIssueCommentsId} data={d} />)}
        </div>

        <div className='d-flex align-items-center p-2'>
          <input type='text' value={comment} onKeyDown={e => e.key === 'Enter' && postComment()} onChange={e => setComment(e.target.value)} placeholder='Add Comment' className={`minimal-input-base mr-2`} style={{ padding: '8px 16px' }} />
          <MinimalButton variant='contained' color='primary' text='Post' loadingText='Posting...' loading={sending} disabled={sending} onClick={postComment} />
        </div>
      </div>
      {isEditOpen && <Edit obj={anchorObj} isEdit open={isEditOpen} afterSubmit={afterSubmit} onClose={() => setIsEditOpen(false)} />}
      {isPreviewOpen[0] && (
        <ImagePreview
          open={isPreviewOpen[0]}
          onClose={() => setPreview([false, 0])}
          imageIndex={imageOrder}
          images={get(data, 'issueImageList', []).filter(d => d.imageDurationTypeId === isPreviewOpen[1])}
          urlKey='imageFileNameUrl'
          hideRotateButton={data.issueStatus === enums.ISSUE.STATUS.RESOLVED ? true : false}
          reFetch={() => setRandomValue(Math.random())}
        />
      )}
    </div>
  )
}

export default IssueDetails
