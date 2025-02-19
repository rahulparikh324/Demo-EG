import React, { useEffect, useState } from 'react'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import _ from 'lodash'
import filterPMtems from '../../Services/Maintainance/filterPMItems.service'
import { history } from '../../helpers/history'

function DashboardMetrics({ assetList, clickOnCheckOutAsset }) {
  useEffect(() => {
    if (!_.isEmpty(assetList)) {
      setCheckoutAssetCount(`${assetList.checkOutAssets.length}`)
      setIssuesCount(`${assetList.outStandingIssuesCount}`)
    }
  }, [assetList])
  useEffect(() => {
    ;(async () => {
      try {
        const payload = {
          pageIndex: 0,
          pageSize: 20,
          pm_id: [],
          internal_asset_id: [],
          pm_plan_id: [],
          search_string: '',
          site_id: [],
          pm_filter_type: 1,
        }
        const res = await filterPMtems(payload)
        setPMsCount(`${res.data.listsize}`)
      } catch (error) {
        setPMsCount(`${0}`)
      }
    })()
  }, [])
  const [checkoutAssetCount, setCheckoutAssetCount] = useState('Loading...')
  const [issuesCount, setIssuesCount] = useState('Loading...')
  const [pmCount, setPMsCount] = useState('Loading...')
  //
  const Metric = ({ count, title, onClick }) => (
    <div onClick={onClick} className='d-flex flex-column justify-content-between' style={{ width: '32%', cursor: 'pointer', height: '100%', background: '#fff', padding: '20px', borderRadius: '4px' }}>
      <div style={{ fontWeight: 800, fontSize: '16px' }}>{title}</div>
      <div className='d-flex justify-content-between align-items-center'>
        <div style={{ fontSize: '28px', color: '#146481', fontWeight: 800 }}>{count}</div>
        <span style={{ background: '#C9F1FF', padding: '8px', borderRadius: '100px' }}>
          <ArrowForwardIosIcon fontSize='small' style={{ color: '#146481' }} />
        </span>
      </div>
    </div>
  )

  const clickedOnUpcomingPM = () => history.push({ pathname: `preventative-maintenance-list`, state: { fromDashboard: true } })
  const clickedOnIssues = () => history.push(`issues`)

  return (
    <div style={styles.container}>
      <Metric title='Upcoming PMs' count={pmCount} onClick={clickedOnUpcomingPM} />
      <Metric title='Checked Out Assets' count={checkoutAssetCount} onClick={clickOnCheckOutAsset} />
      <Metric title='Outstanding Issues' count={issuesCount} onClick={clickedOnIssues} />
    </div>
  )
}

const styles = {
  container: { display: 'flex', height: '14%', marginBottom: '15px', justifyContent: 'space-between' },
}

export default DashboardMetrics
