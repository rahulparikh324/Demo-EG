import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import getAllAssetIdList from '../../Services/Reports/getAllAssetIdListService'
import post from '../../Services/postService'
import Button from '@material-ui/core/Button'
import _ from 'lodash'
import $ from 'jquery'
import momenttimezone from 'moment-timezone'
import URL from '../../Constants/apiUrls'
import InspectionImage from './inspectionImagePopup'
import PhotoOutlinedIcon from '@material-ui/icons/PhotoOutlined'
import Chip from '@material-ui/core/Chip'
import Divider from '@material-ui/core/Divider'
import InfiniteScroll from 'react-infinite-scroll-component'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  listbox: {
    fontSize: 13,
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
    },
  },
  option: { fontSize: 14, color: 'red' },
})

function AssetWiseInspectionPhotos(props) {
  const loginData = JSON.parse(localStorage.getItem('loginData'))
  const [allAssets, setAllAssets] = useState([])
  const [list, setList] = useState([])
  const [notOkItems, setNotOkItems] = useState([])
  const [selectedAsset, setSelectedAsset] = useState({})
  const [validationErrorMsg, setValidationErrorMsg] = useState('')
  const [toastErrorMsg, setToastErrorMsg] = useState({ error: false })
  const [showPopup, setShowPopup] = useState(false)
  const [image, setImage] = useState('')
  const [pageIndex, setPageIndex] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    stringify: option => option.name.trim() + option.internal_asset_id,
    trim: true,
  })
  const { classes } = props

  const setValues = val => {
    setToastErrorMsg({ msg: '', error: false })
    setHasMore(true)
    setList([])
    setNotOkItems([])
    setPageIndex(1)
    setSelectedAsset(val)
    setValidationErrorMsg('')
  }
  ////console(list, pageIndex)

  const fetchData = () => {
    if (_.isEmpty(selectedAsset)) {
      setValidationErrorMsg('Please select an Asset first !')
      return
    }
    ////console(selectedAsset, loginData.uuid)
    const reqPayload = {
      internal_asset_id: selectedAsset.internal_asset_id,
      pagesize: 20,
      pageindex: 1,
    }
    $('#pageLoading').show()
    setToastErrorMsg({ msg: 'Error in fetching Assets', error: false })
    post(`${URL.assetWiseInspections}`, reqPayload)
      .then(res => {
        ////console(res.data)
        if (res.data.message) {
          setToastErrorMsg({ msg: `No data found for ${selectedAsset.name}`, error: true })
          $('#pageLoading').hide()
        } else {
          ////console(res.data.data.list)
          const arr = res.data.data.list
          const x = []
          arr.forEach(insp => {
            const q = []
            insp.attributes.forEach(element => {
              if (element.attribute_values.length !== 0) {
                const x = element.attribute_values
                x.forEach(currentItem => q.push(currentItem.name))
              }
            })
            x.push(q)
          })
          if (arr.length < 20) {
            setHasMore(false)
            setPageIndex(1)
          } else {
            setPageIndex(2)
            setHasMore(true)
          }

          setList(arr)
          setNotOkItems(x)
          ////console('Fetching the initial')

          $('#pageLoading').hide()
        }
      })
      .catch(err => {
        ////console(err)
        setToastErrorMsg({ msg: 'Error in fetching Assets', error: true })
        $('#pageLoading').hide()
      })
  }

  const fetchMoreData = () => {
    // //console('Fetching for page index', pageIndex)
    const reqPayload = {
      requested_by: loginData.uuid,
      internal_asset_id: selectedAsset.internal_asset_id,
      pagesize: 20,
      pageindex: pageIndex,
    }
    $('#pageLoading').show()
    post(`${URL.assetWiseInspections}`, reqPayload)
      .then(res => {
        // //console(res.data)
        // //console(res.data.data.list)
        const arr = res.data.data.list
        const x = []
        arr.forEach(insp => {
          const q = []
          insp.attributes.forEach(element => {
            if (element.attribute_values.length !== 0) {
              const x = element.attribute_values
              x.forEach(currentItem => q.push(currentItem.name))
            }
          })
          x.push(q)
        })
        if (arr.length < 20) {
          setHasMore(false)
          setPageIndex(1)
        } else {
          setPageIndex(p => p + 1)
        }
        const extendedList = [...list].concat(arr)
        const extendedNotOkList = [...notOkItems].concat(x)
        setList(extendedList)
        setNotOkItems(extendedNotOkList)
        $('#pageLoading').hide()
        const div = document.getElementById(`${arr[0].inspection_id}`)
        div.scrollIntoView()
      })
      .catch(err => {
        ////console(err)
        setToastErrorMsg({ msg: 'Error in fetching Assets', error: true })
        $('#pageLoading').hide()
      })
  }

  const handleImgClick = value => {
    setImage(value)
    setShowPopup(true)
  }

  useEffect(() => {
    $('#pageLoading').show()
    getAllAssetIdList(loginData.uuid)
      .then(res => {
        ////console(res.data.data)
        setAllAssets(res.data.data)
        $('#pageLoading').hide()
      })
      .catch(err => {
        ////console(err)
        setToastErrorMsg({ msg: 'Error in fetching Assets', error: true })
        setAllAssets([])
        $('#pageLoading').hide()
      })
  }, [loginData.uuid])

  return (
    <div style={{ height: '93vh', padding: '20px' }}>
      <Grid container className='row' item xs={12} style={Inlinestyles.row}>
        <Grid className='col-md-4'>
          <Grid className='assets-info-devider ss-multi-select'>
            <Autocomplete
              size='small'
              classes={{ listbox: classes.listbox }}
              filterOptions={filterOptions}
              id='assetId'
              options={allAssets}
              getOptionLabel={option => option.name}
              name='assetId'
              onChange={(e, val) => setValues(val)}
              noOptionsText='No asset found'
              renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Asset' name='assetId' className='filter-input-disable-lastpass' />}
            />
            {validationErrorMsg.length !== 0 && <div style={{ color: '#f44336', fontSize: '0.75rem', paddingLeft: '4px', fontWeight: 800 }}>{validationErrorMsg}</div>}
          </Grid>
        </Grid>
        <Button variant='contained' color='primary' className='nf-buttons mt-2' onClick={() => fetchData()} disableElevation>
          Generate
        </Button>
      </Grid>
      {list.length !== 0 && notOkItems.length !== 0 && list.length === notOkItems.length && (
        <Grid item xs={12} style={Inlinestyles.container} id='scrollableDiv'>
          <InfiniteScroll scrollThreshold={1} dataLength={list.length} next={fetchMoreData} hasMore={hasMore} loader={<h5>Loading...</h5>} scrollableTarget='scrollableDiv'>
            {list.map((insp, index) => (
              <Grid item xs={12} style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '30px' }} key={insp.inspection_id} id={insp.inspection_id}>
                <Grid className='row'>
                  <Grid className='col-md-3'>
                    <span style={{ fontWeight: 600 }}>Date :</span> {momenttimezone.utc(insp.created_at).tz(insp.sites.timezone).format('MM-DD-YYYY LT')}
                  </Grid>
                  <Divider orientation='vertical' flexItem />
                  <Grid className='col-md-3'>
                    <span style={{ fontWeight: 600 }}>Operator :</span> {insp.operator_name}
                  </Grid>
                  {insp.manager_name && (
                    <>
                      <Divider orientation='vertical' flexItem />
                      <Grid className='col-md-4'>
                        <span style={{ fontWeight: 600 }}>Assigned Manager :</span> {insp.manager_name}
                      </Grid>
                    </>
                  )}
                  <Grid className='col-md-2'>
                    <span style={{ fontWeight: 600 }}>Meter Hours :</span> {insp.meter_hours}
                  </Grid>
                </Grid>
                <Grid className='row' style={{ margin: '15px -15px', alignItems: 'center' }}>
                  <Grid className='col-md-2'>
                    <span style={{ fontWeight: 600 }}>New attributes Marked Not OK : </span>
                  </Grid>
                  <Grid className='col-md-10'>{notOkItems.length !== 0 && notOkItems[index].length !== 0 && notOkItems[index].map((item, ind) => <Chip label={item} key={ind} style={{ marginRight: '5px', marginBottom: '5px' }} />)}</Grid>
                </Grid>
                <Grid className='row' style={{ paddingLeft: '16px', marginBottom: '14px' }}>
                  {insp.image_list !== null && insp.image_list.image_names.length !== 0 ? (
                    insp.image_list.image_names.map((value, key) => (
                      <div className='img-box' key={key}>
                        <img src={value} alt='Failed to load !' onClick={() => handleImgClick(value)} />
                      </div>
                    ))
                  ) : (
                    <div style={Inlinestyles.noPhoto}>
                      <PhotoOutlinedIcon fontSize='default' style={{ marginRight: '4px', fill: '#808080' }} />
                      <span style={{ fontWeight: 600, color: '#808080' }}>No photos</span>
                    </div>
                  )}
                </Grid>
                <Divider orientation='horizontal' flexItem />
              </Grid>
            ))}
          </InfiniteScroll>
        </Grid>
      )}
      {toastErrorMsg.error && (
        <Grid className='row' item xs={12} style={{ ...Inlinestyles.row, justifyContent: 'center', fontWeight: 800 }}>
          {toastErrorMsg.msg}
        </Grid>
      )}
      {showPopup && <InspectionImage closePopUp={() => setShowPopup(false)} img={image} />}
    </div>
  )
}

export default withStyles(styles)(AssetWiseInspectionPhotos)

const Inlinestyles = {
  row: { background: '#fff', borderRadius: '8px', padding: '16px', marginTop: '16px', display: 'flex', alignItems: 'center' },
  container: { padding: '16px', marginTop: '16px', background: '#fff', borderRadius: '8px', height: '77vh', overflowY: 'scroll' },
  noPhoto: { display: 'flex', padding: '16px 0', alignItems: 'center' },
}
