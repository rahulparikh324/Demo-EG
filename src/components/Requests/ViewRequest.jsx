import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from '../Maintainance/components'
import '../Maintainance/maintainance.css'
import { NavigatLinkToNewTab } from './components'
import { useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  strong: { fontWeight: 600 },
  containerDiv: { display: 'flex', flexDirection: 'column', height: '100%', width: '450px', background: '#efefef' },
  containerSubDiv: { borderRadius: '4px', margin: '8px', background: '#fff', display: 'flex', flexDirection: 'column' },
}))

function ViewRequest({ open, onClose, viewObj }) {
  const classes = useStyles()
  const theme = useTheme()
  const [isDescLarge, setIsDescLarge] = useState(false)
  const [isReadMore, setReadMore] = useState(false)
  //
  useEffect(() => {
    if (viewObj.description && viewObj.description.length > 180) setIsDescLarge(true)
  }, [])

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={viewObj.title} closeFunc={onClose} />
      <div className={classes.containerDiv}>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 70px)', height: 'calc(100vh - 70px)', overflowX: 'hidden' }}>
          <div className={classes.containerSubDiv}>
            <div className='p-3'>
              <div className={classes.strong}>Description</div>
              <div>
                {viewObj.description && viewObj.description.slice(0, 180)}
                {!isReadMore && isDescLarge && <span>.........</span>}
                {isReadMore && viewObj.description.slice(180)}
              </div>
              {isDescLarge && (
                <button className='readmore-button' onClick={() => setReadMore(!isReadMore)}>
                  {!isReadMore ? 'Read More' : 'Read less'}
                </button>
              )}
            </div>
            <div className='p-3 d-flex'>
              <div className={classes.strong}>Priority : </div>
              <div>{viewObj.priority_name}</div>
            </div>
          </div>
          <NavigatLinkToNewTab title='Asset Info' func={() => window.open(`assets/details/${viewObj.asset.asset_id}`, '_blank')}>
            {viewObj.asset && (
              <>
                <i>
                  <strong style={{ color: theme.palette.primary.main }}>#{viewObj.asset.internal_asset_id}</strong> - {viewObj.asset.name}
                </i>
                <div>
                  <i>
                    Current Meter Hours: <strong style={{ color: theme.palette.primary.main }}>{viewObj.asset.meter_hours}</strong>
                  </i>
                </div>
              </>
            )}
          </NavigatLinkToNewTab>
          {viewObj.mr_type === 53 && (
            <NavigatLinkToNewTab func={() => window.open(`inspections/details/${viewObj.inspection_id}`, '_blank')} title='Inspection Info'>
              <i>
                Meters at Inspection: <strong style={{ color: theme.palette.primary.main }}>{viewObj.meter_at_inspection}</strong>
              </i>
            </NavigatLinkToNewTab>
          )}
          {viewObj.workOrders && (
            <div className='p-3 my-2 d-flex flex-row justify-content-between align-items-center bg-white' style={{ borderRadius: '4px', margin: '8px', cursor: 'pointer' }}>
              <div>
                <span className='form-acc-title acc-cont-title bg-white'>Work Order</span>
                <div>
                  <i>
                    <strong style={{ color: theme.palette.primary.main }}># {viewObj.workOrders.wo_number}</strong> - {viewObj.workOrders.title}
                  </i>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}

export default ViewRequest
